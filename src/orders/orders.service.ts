import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Order } from './entities/order.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { Ticket } from '../tickets/entities/ticket.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepo: Repository<TicketType>,
  ) {}

  @OnEvent('order.confirmed')
async confirmOrder(payload: { sessionId: string; metadata: Record<string, string> }): Promise<void> {
  console.log('📥 order.confirmed recibido', payload.sessionId);
    const order = await this.orderRepo.findOne({ where: { transactionId: payload.sessionId } });
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
      console.log(`✅ Orden ${order.id} confirmada — ${quantity} ticket(s) generados`);
    } else {
      console.log(`✅ Orden ${order.id} confirmada — sin ticketType en metadata`);
    }
  }

  @OnEvent('order.failed')
  async failOrder(sessionId: string): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { transactionId: sessionId } });
    if (!order) return;

    order.status = OrderStatus.FAILED;
    await this.orderRepo.save(order);
    console.log(`❌ Orden ${order.id} fallida`);
  }

  @OnEvent('order.refunded')
  async refundOrder(paymentIntentId: string): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { transactionId: paymentIntentId } });
    if (!order) return;

    order.status = OrderStatus.REFUNDED;
    await this.orderRepo.save(order);
    console.log(`💸 Orden ${order.id} reembolsada`);
  }
}