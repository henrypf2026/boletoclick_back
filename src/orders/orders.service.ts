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

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly ticketsService: TicketsService,
    private readonly ticketTypesService: TicketTypesService,
    // 🔔 PRODUCCIÓN: Inyectar CouponsService cuando esté listo
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
    const total = basePrice * quantity;
    const platformFee = total * 0.1;
    const producerSubtotal = total - platformFee;

    // 2. 🎫 Gestión de Cupones (Mocked) cambiar cuando se tenga el recurso de cupones implementado
    if (couponId) {
      console.log(`[MOCK] Cupón ${couponId} recibido pero ignorado por ahora.`);
    }

    // 3. 💾 Persistencia inicial de la Orden
    // 🚧 MOCK: La guardamos directamente como PAID para que el Front funcione ya.
    const newOrder = await this.ordersRepository.createOrder({
      total,
      producerSubtotal,
      platformFee,
      status: OrderStatus.PAID, // 🔔 PRODUCCIÓN: Cambiar a OrderStatus.PENDING (El usuario aún no ha pagado)
      transactionId: `mock_tx_${Math.random().toString(36).substring(2, 11).toUpperCase()}`, // 🔔 PRODUCCIÓN: Borrar esta línea. El ID real llega en el Webhook.
      user: { id: userId } as any,
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
    if (!order)
      throw new NotFoundException('Orden no encontrada o no tienes acceso.');
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
