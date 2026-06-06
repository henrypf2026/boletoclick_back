import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
  ): Promise<{ clientSecret: string | null }> {
    const intent = await this.stripeService.createPaymentIntent(
      dto.amount,
      dto.currency,
    );
    return { clientSecret: intent.client_secret };
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    const event = this.stripeService.constructWebhookEvent(req.rawBody, signature);
    const paymentIntent = event.data.object as any;

    switch (event.type) {
      case 'payment_intent.succeeded':
        this.eventEmitter.emit('order.confirmed', paymentIntent.id);
        break;
      case 'payment_intent.payment_failed':
        this.eventEmitter.emit('order.failed', paymentIntent.id);
        break;
      case 'charge.refunded':
        this.eventEmitter.emit('order.refunded', paymentIntent.payment_intent);
        break;
    }

    return { received: true };
  }
}