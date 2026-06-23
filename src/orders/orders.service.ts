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
import { Ticket } from '../tickets/entities/ticket.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepo: Repository<TicketType>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
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

    order.status = OrderStatus.PAID;
    await this.orderRepo.save(order);

    const quantity = parseInt(payload.metadata?.quantity ?? '1');
    const ticketType = await this.ticketTypeRepo.findOne({
      where: { id: payload.metadata?.ticketTypeId },
    });

    if (ticketType) {
      const tickets = Array.from({ length: quantity }, () =>
        this.ticketRepo.create({
          qrCode: randomBytes(16).toString('hex'),
          allowEntrance: true,
          order: { id: order.id } as Order,
          ticketType: { id: ticketType.id } as TicketType,
        }),
      );
      await this.ticketRepo.save(tickets);
      console.log(
        `✅ Orden ${order.id} confirmada — ${quantity} ticket(s) generados`,
      );
    } else {
      console.log(
        `✅ Orden ${order.id} confirmada — sin ticketType en metadata`,
      );
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
