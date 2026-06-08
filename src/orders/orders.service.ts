<<<<<<< HEAD
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/orders.entity';
import { OrderItem } from './entities/orders-item.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { StripeService } from '../stripe/stripe.service';
import { CreateOrderDto } from './dto/create-order.dto';
=======
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { Order } from './entities/order.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { TicketsService } from '../tickets/tickets.service';
import { TicketTypesService } from '../ticket-types/ticket-types.service';
import { CouponsService } from '../coupons/coupons.service';
>>>>>>> 979f4138f8e69a55bc78157a1650cbc480bf2bbc

@Injectable()
export class OrdersService {
  constructor(
<<<<<<< HEAD
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
=======
    private readonly ordersRepository: OrdersRepository,
    private readonly ticketsService: TicketsService,
    private readonly ticketTypesService: TicketTypesService,
    private readonly couponsService: CouponsService,
  ) {}

  async createOrder(
    userId: string,
    orderData: { ticketTypeId: string; quantity: number; couponId?: string },
  ): Promise<Order> {
    // 🔔 PRODUCCIÓN: El return ya no será solo la orden. Será: Promise<{ order: Order, checkoutUrl: string }>
    const { ticketTypeId, quantity, couponId } = orderData;

    // 1. 🔍 Consulta real de la localidad y su precio
    const ticketType =
      await this.ticketTypesService.getTicketTypeById(ticketTypeId);
    const basePrice = ticketType.price;
    let total = basePrice * quantity;

    // 2. 🎫 Gestión de Cupones (Mocked) cambiar cuando se tenga el recurso de cupones implementado
    if (couponId) {
      const coupon = await this.couponsService.getCouponById(couponId);
      if (!coupon.isActive || new Date(coupon.expiresAt) < new Date()) {
        throw new BadRequestException(
          'El cupón proporcionado ya no está activo o ha expirado.',
        );
      }
      if (coupon.eventId && coupon.eventId !== ticketType.eventId) {
        throw new BadRequestException(
          'Este cupón no es válido para las entradas de este evento específico.',
        );
      }
      let discount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discount = total * (coupon.discountValue / 100);
      } else if (coupon.discountType === 'FIXED') {
        discount = coupon.discountValue;
      }
      total = Math.max(0, total - discount);
    }

    const platformFee = total * 0.1;
    const producerSubtotal = total - platformFee;

    // 3. 💾 Persistencia inicial de la Orden
    // 🚧 MOCK: La guardamos directamente como PAID para que el Front funcione ya.
    const newOrder = await this.ordersRepository.createOrder({
      total,
      producerSubtotal,
      platformFee,
      status: OrderStatus.PAID, // 🔔 PRODUCCIÓN: Cambiar a OrderStatus.PENDING (El usuario aún no ha pagado)
      transactionId: `mock_tx_${Math.random().toString(36).substring(2, 11).toUpperCase()}`, // 🔔 PRODUCCIÓN: Borrar esta línea. El ID real llega en el Webhook.
      user: { id: userId } as any,
      coupon: couponId ? ({ id: couponId } as any) : null,
    });

    // 4. 💳 Conexión con la Pasarela de Pagos (Stripe / Mercado Pago)
    // ====================================================================================
    // 🔔 PRODUCCIÓN: AQUÍ ES DONDE SE CONECTA LA PASARELA.
    // Debes agregar las siguientes líneas de código:
    //
    // const session = await this.stripeService.createCheckoutSession({
    //   orderId: newOrder.id,
    //   amount: newOrder.total,
    //   description: `Entradas para el evento - ${ticketType.name}`
    // });
    //
    // La pasarela te devolverá un objeto gigante, del cual vas a extraer la URL de cobro:
    // const checkoutUrl = session.url;

    // Devolver al front la orden en estado PENDING y el checkoutUrl
    // return {
    //   order: newOrder,     // Va con estado PENDING
    //   checkoutUrl // El Front redirigirá al usuario a este link para que pague
    // };
    // ====================================================================================

    //=================================================================================================
    // 5. 🚧 MOCK / PASARELA: Generación inmediata solo para que el Front pueda hacer pruebas hoy.
    //  🖨️ Generación de Tiquetes: Todo este bloque de 'createBulkTickets' se mudará al método 'handleWebhook'
    // 🔔 PRODUCCIÓN: ¡ESTA LLAMADA SE BORRA COMPLETAMENTE DE AQUÍ!
    // en el método webhook, si el pago es exitoso se cambia la orden de estado a PAID y se crean los tickets

    await this.ticketsService.createBulkTickets(
      newOrder.id,
      ticketTypeId,
      quantity,
    );

    //cuando se completa la transacción, la pasarela devuelve al usuario a nuestra plataforma y le muestra los tickets
    //acá se podría generar la notificación por correo de la compra
    return newOrder;
  }

  async findMyOrders(userId: string): Promise<Order[]> {
    return await this.ordersRepository.findMyOrders(userId);
  }

  async findOrderByIdAndUser(id: string, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findOrderByIdAndUser(id, userId);
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  async findOrderById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOrderById(id);
    if (!order)
      throw new NotFoundException(`Orden con ID '${id}' no encontrada.`);
    return order;
  }

  async findAllOrders(
    producerId: string,
    status?: OrderStatus,
    userId?: string,
  ): Promise<Order[]> {
    return await this.ordersRepository.findAllOrders(
      producerId,
      status,
      userId,
    );
  }
}
>>>>>>> 979f4138f8e69a55bc78157a1650cbc480bf2bbc
