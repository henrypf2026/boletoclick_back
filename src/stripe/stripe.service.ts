import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import type { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { User } from '../users/entities/user.entity';

type StripeClient = InstanceType<typeof Stripe>;

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: StripeClient,
    private readonly config: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async createPaymentIntent(amount: number, currency = 'usd'): Promise<any> {
    return this.stripe.paymentIntents.create({ amount, currency });
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto): Promise<any> {
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');

    const platformFee = Math.round(dto.total * 0.05 * 100) / 100;
    const producerSubtotal = Math.round((dto.total - platformFee) * 100) / 100;

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          quantity: dto.quantity,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round((dto.total / dto.quantity) * 100),
            product_data: {
              name: dto.eventTitle,
              description: `${dto.venue} · ${dto.date} ${dto.time}`,
            },
          },
        },
      ],
      metadata: {
        userId: dto.userId,
        eventId: dto.eventId,
        quantity: dto.quantity.toString(),
      },
      success_url: `${frontendUrl}/payment-result?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/eventos/${dto.eventId}?canceled=true`,
    });

    const order = this.orderRepo.create({
      total: dto.total,
      producerSubtotal,
      platformFee,
      status: OrderStatus.PENDING,
      transactionId: session.id,
      user: { id: dto.userId } as User,
    });
    await this.orderRepo.save(order);

    return session;
  }

  async verifySession(sessionId: string): Promise<boolean> {
    const order = await this.orderRepo.findOne({
      where: { transactionId: sessionId },
    });
    return order?.status === OrderStatus.PAID;
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): any {
    const secret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
}