import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/orders.entity';
import { OrderItem } from './entities/orders-item.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { StripeService } from '../stripe/stripe.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepo: Repository<TicketType>,
    private readonly stripeService: StripeService,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<{ order: Order; clientSecret: string | null }> {
    // 1. Validar stock y calcular total dentro de una transacción
    return this.dataSource.transaction(async (manager) => {
      let total = 0;
      const itemsData: { ticketType: TicketType; quantity: number }[] = [];

      for (const item of dto.items) {
        const ticketType = await manager.findOne(TicketType, {
          where: { id: item.ticketTypeId },
        });

        if (!ticketType) {
          throw new NotFoundException(`TicketType ${item.ticketTypeId} no encontrado`);
        }
        if (ticketType.stock < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para ${ticketType.name}`);
        }

        total += (ticketType.price ?? 0) * item.quantity;
        itemsData.push({ ticketType, quantity: item.quantity });
      }

      // 2. Crear PaymentIntent en Stripe (monto en centavos)
      const paymentIntent = await this.stripeService.createPaymentIntent(
        Math.round(total * 100),
        'ars',
      );

      // 3. Crear la orden en estado PENDING
      const order: Order = manager.create(Order, {
  userId: dto.userId,
  eventId: dto.eventId,
  paymentIntentId: paymentIntent.id,
  total,
  status: OrderStatus.PENDING,
});
      await manager.save(order);

      // 4. Crear los items y descontar stock
      for (const { ticketType, quantity } of itemsData) {
        const orderItem = manager.create(OrderItem, {
          orderId: order.id,
          ticketTypeId: ticketType.id,
          quantity,
          unitPrice: ticketType.price,
        });
        await manager.save(orderItem);

        // Descontar stock
        await manager.decrement(TicketType, { id: ticketType.id }, 'stock', quantity);
      }

      return { order, clientSecret: paymentIntent.client_secret };
    });
  }

  async confirmOrder(paymentIntentId: string): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { paymentIntentId } });
    if (!order) throw new NotFoundException(`Orden con paymentIntentId ${paymentIntentId} no encontrada`);

    order.status = OrderStatus.CONFIRMED;
    await this.orderRepo.save(order);

    // Acá podés disparar: envío de email, generación de QR, etc.
    console.log(`✅ Orden ${order.id} confirmada`);
  }

  async failOrder(paymentIntentId: string): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { paymentIntentId },
      relations: { items: true },
    });
    if (!order) return;

    order.status = OrderStatus.FAILED;
    await this.orderRepo.save(order);

    // Devolver stock
    for (const item of order.items) {
      await this.dataSource.manager.increment(
        TicketType,
        { id: item.ticketTypeId },
        'stock',
        item.quantity,
      );
    }

    console.log(`❌ Orden ${order.id} fallida — stock restaurado`);
  }

  async refundOrder(paymentIntentId: string): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { paymentIntentId } });
    if (!order) return;

    order.status = OrderStatus.REFUNDED;
    await this.orderRepo.save(order);

    console.log(`💸 Orden ${order.id} reembolsada`);
  }
}
