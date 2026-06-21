import {
  Injectable,
  Inject,
  NotFoundException,
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import type { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { User } from '../users/entities/user.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { TicketLocksService } from '../ticket-locks/ticket-locks.service';

type StripeClient = InstanceType<typeof Stripe>;

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: StripeClient,
    private readonly config: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepo: Repository<TicketType>,
    private readonly ticketLocksService: TicketLocksService,
  ) {}

  async createPaymentIntent(amount: number, currency = 'usd'): Promise<any> {
    return this.stripe.paymentIntents.create({ amount, currency });
  }

  async createCheckoutSession(
    dto: CreateCheckoutSessionDto & { userId: string },
  ): Promise<any> {
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');

    const ticketType = await this.ticketTypeRepo.findOne({
      where: { id: dto.ticketTypeId },
      relations: { event: true },
    });
    if (!ticketType) {
      throw new NotFoundException(
        `TicketType ${dto.ticketTypeId} no encontrado`,
      );
    }

    // ✅ Total calculado desde la DB — el frontend no puede manipular el precio
    const unitPrice = Number(ticketType.price);
    const total = Math.round(unitPrice * dto.quantity * 100) / 100;
    const platformFee = Math.round(total * 0.05 * 100) / 100;
    const producerSubtotal = Math.round((total - platformFee) * 100) / 100;

    const event = ticketType.event;
    const eventDate = new Date(event.eventDate);
    const date = eventDate.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const time = eventDate.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const lock = await this.ticketLocksService.reserveTickets(
      dto.ticketTypeId,
      dto.userId,
      dto.quantity,
      expiresAt,
    );

    let session: any;
    try {
      session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            quantity: dto.quantity,
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(unitPrice * 100),
              product_data: {
                name: event.title,
                description: `${date} ${time}`,
              },
            },
          },
        ],
        metadata: {
          userId: dto.userId,
          eventId: event.id,
          ticketTypeId: dto.ticketTypeId,
          quantity: dto.quantity.toString(),
        },
        success_url: `${frontendUrl}/payment-result?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/eventos/${event.id}?canceled=true`,
      });

      await this.ticketLocksService.linkStripeSession(lock.id, session.id);

      const order = this.orderRepo.create({
        total,
        producerSubtotal,
        platformFee,
        status: OrderStatus.PENDING,
        transactionId: session.id,
        user: { id: dto.userId } as User,
      });
      await this.orderRepo.save(order);
    } catch (error) {
      await this.ticketLocksService.releaseLock(lock.id);
      throw error;
    }

    return {
      url: session.url,
      expiresAt,
      sessionId: session.id,
    };
  }

  async handleWebhookEvent(rawBody: Buffer, signature: string): Promise<void> {
    const secret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      secret,
    );
    const session = event.data.object as any;

    switch (event.type) {
      case 'checkout.session.completed':
        console.log(
          '🔔 Webhook recibido: checkout.session.completed',
          session.id,
        );
        const lockConfirmed =
          await this.ticketLocksService.confirmLockByStripeSessionId(
            session.id,
          );

        if (!lockConfirmed) {
          console.warn(
            `⚠️ No se pudo confirmar el ticket lock para la sesión Stripe ${session.id}`,
          );
          return;
        }

        this.eventEmitter.emit('order.confirmed', {
          sessionId: session.id,
          metadata: session.metadata,
        });
        console.log('📤 Evento order.confirmed emitido');
        break;
      case 'checkout.session.expired':
        await this.ticketLocksService.releaseLockByStripeSessionId(session.id);
        this.eventEmitter.emit('order.failed', session.id);
        break;
      case 'charge.refunded':
        this.eventEmitter.emit('order.refunded', session.payment_intent);
        break;
    }
  }

  @OnEvent('stripe.expire-session')
  async expireStripeSession(sessionId: string): Promise<void> {
    try {
      await this.stripe.checkout.sessions.expire(sessionId);
      console.log(`✅ Stripe session ${sessionId} expirada correctamente`);
    } catch (error: unknown) {
      console.warn(
        `⚠️ No se pudo expirar la sesión Stripe ${sessionId}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  async verifySession(sessionId: string): Promise<boolean> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    const status = session.payment_status;
    console.log({ status });

    if (session.payment_status !== 'paid') {
      return false;
    }

    const { quantity, ticketTypeId } = session.metadata as {
      quantity: string;
      ticketTypeId: string;
    };

    const order = await this.orderRepo.findOne({
      where: { transactionId: sessionId },
    });
    if (!order) throw new BadRequestException('Orden no encontrada');
    if (order.status === OrderStatus.PAID)
      throw new BadRequestException('Orden ya pagada');
    order.status = OrderStatus.PAID;
    await this.orderRepo.save(order);
    await this.ticketService.createBulkTickets({
      orderId: order.id,
      ticketTypeId,
      quantity,
    });

    return true;
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): any {
    const secret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
}
