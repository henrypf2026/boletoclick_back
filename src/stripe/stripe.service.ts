import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import type { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

type StripeClient = InstanceType<typeof Stripe>;

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: StripeClient,
    private readonly config: ConfigService,
  ) {}

  async createPaymentIntent(amount: number, currency = 'usd'): Promise<any> {
    return this.stripe.paymentIntents.create({ amount, currency });
  }

  async createCheckoutSession(data: CreateCheckoutSessionDto): Promise<any> {
    const successUrl = this.config.getOrThrow<string>('FRONTEND_URL') + '/mis-tickets?success=true';
    const cancelUrl = this.config.getOrThrow<string>('FRONTEND_URL') + '/eventos/' + data.eventId + '?canceled=true';

    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          quantity: data.quantity,
          price_data: {
            currency: 'mxn',
            unit_amount: Math.round((data.total / data.quantity) * 100),
            product_data: {
              name: data.eventTitle,
              description: `${data.venue} · ${data.date} ${data.time}`,
            },
          },
        },
      ],
      metadata: {
        orderId: data.id,
        userId: data.userId,
        eventId: data.eventId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): any {
    const secret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
}