import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Order } from './entities/order.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { EmailService } from '../email/email.service';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly ticketsService: TicketsService,
  ) {}

  @OnEvent('order.confirmed')
  async confirmOrder(payload: {
    sessionId: string;
    metadata: Record<string, string>;
  }): Promise<void> {
    console.log('📥 order.confirmed recibido', payload.sessionId);

    const order = await this.orderRepo.findOne({
      where: { transactionId: payload.sessionId },
    });

    if (!order) {
      console.warn(`⚠️ Orden con sessionId ${payload.sessionId} no encontrada`);
      return;
    }

    if (order.status === OrderStatus.PAID) {
      console.log(
        `ℹ️ Orden ${order.id} ya estaba PAID — se omite creación de tickets`,
      );
      return;
    }

    // 3. 🔥 ACTUALIZACIÓN ATÓMICA: Modificamos el estado SOLO si sigue en PENDING.
    // PostgreSQL resuelve esto de forma segura en un único paso atómico.
    const updateResult = await this.orderRepo.update(
      { id: order.id, status: OrderStatus.PENDING }, // Condición estricta
      { status: OrderStatus.PAID }, // Cambio deseado
    );

    // Si affected es 0, significa que otro proceso paralelo ganó la carrera y cambió el estado primero
    if (updateResult.affected === 0) {
      console.log(
        `ℹ️ Concurrencia evitada: La orden ${order.id} ya fue procesada por otro hilo.`,
      );
      return;
      ``;
    }

    // 4. Al haber ganado la actualización, este hilo es el único autorizado para crear las boletas
    const quantity = payload.metadata?.quantity ?? '1';
    const ticketTypeId = payload.metadata?.ticketTypeId;

    if (ticketTypeId) {
      // Delegamos de forma segura la creación de los JWT firmados
      await this.ticketsService.createBulkTickets({
        orderId: order.id,
        ticketTypeId,
        quantity,
      });

      console.log(
        `✅ Orden ${order.id} confirmada — tickets JWT generados exitosamente`,
      );

      // 📧 Espacio ideal para activar el envío de email de éxito en el futuro
      // await this.emailService.sendOrderConfirmation(order.id);
    }
  }

  @OnEvent('order.failed')
  async failOrder(sessionId: string): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { transactionId: sessionId },
    });
    if (!order) return;

    order.status = OrderStatus.FAILED;
    await this.orderRepo.save(order);
    console.log(`❌ Orden ${order.id} fallida`);
  }

  @OnEvent('order.refunded')
  async refundOrder(paymentIntentId: string): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { transactionId: paymentIntentId },
    });
    if (!order) return;

    order.status = OrderStatus.REFUNDED;
    await this.orderRepo.save(order);
    console.log(`💸 Orden ${order.id} reembolsada`);
  }

  async findMyOrders(userId: string): Promise<Order[]> {
    return await this.orderRepo.find({
      where: {
        user: { id: userId },
      },
      relations: {
        tickets: {
          ticketType: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async cancelOrder(
    orderId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let orderForEmail: Order | null = null;

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: {
          user: true,
          tickets: {
            ticketType: {
              event: {
                venue: true,
              },
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException('La orden no existe.');
      }

      if (order.user.id !== userId) {
        throw new ForbiddenException(
          'No tienes permisos para cancelar esta orden.',
        );
      }

      if (order.status !== OrderStatus.PAID) {
        throw new BadRequestException(
          `Solo se pueden cancelar órdenes en estado PAGADO. Estado actual: ${order.status}`,
        );
      }

      if (!order.tickets || order.tickets.length === 0) {
        throw new BadRequestException('La orden no tiene tickets asociados.');
      }

      const event = order.tickets[0].ticketType?.event;
      if (!event) {
        throw new BadRequestException(
          'No se pudo encontrar el evento asociado a la orden.',
        );
      }

      const eventDate = new Date(event.eventDate);
      const now = new Date();
      const timeDiff = eventDate.getTime() - now.getTime();
      const fortyEightHoursInMs = 48 * 60 * 60 * 1000;

      if (timeDiff < fortyEightHoursInMs) {
        throw new BadRequestException(
          'No se puede cancelar a menos de 48 hs del evento',
        );
      }

      // 1. Cambiar estado de la orden
      order.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(order);

      // 2. Deshabilitar tickets e incrementar stock
      for (const ticket of order.tickets) {
        ticket.allowEntrance = false;
        await queryRunner.manager.save(ticket);

        if (ticket.ticketTypeId) {
          await queryRunner.manager.increment(
            TicketType,
            { id: ticket.ticketTypeId },
            'stock',
            1,
          );
        }
      }

      await queryRunner.commitTransaction();
      orderForEmail = order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Enviar email fuera de la transacción para no bloquear la base de datos
    if (orderForEmail) {
      try {
        const firstTicket = orderForEmail.tickets[0];
        const event = firstTicket.ticketType.event;
        await this.emailService.sendOrderCancellationEmail(
          orderForEmail.user.email,
          orderForEmail.user.name,
          event.title,
          orderForEmail.id,
          new Date(event.eventDate).toLocaleString('es-ES'),
          event.venue.name,
          orderForEmail.total,
        );
      } catch (emailError: any) {
        console.error(
          `⚠️ Error al enviar correo de cancelación: ${emailError.message}`,
        );
      }
    }

    return { message: 'Orden cancelada exitosamente.' };
  }
}
