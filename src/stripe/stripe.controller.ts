import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Req,
  Param,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

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

  @Post('create-session')
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<{ url: string }> {
    const session = await this.stripeService.createCheckoutSession(dto);
    return { url: session.url };
  }

  @Get('verify/:sessionId')
  async verifySession(
    @Param('sessionId') sessionId: string,
  ): Promise<{ valid: boolean }> {
    const valid = await this.stripeService.verifySession(sessionId);
    return { valid };
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
    const session = event.data.object as any;

    switch (event.type) {
      case 'checkout.session.completed':
        this.eventEmitter.emit('order.confirmed', {
          sessionId: session.id,
          metadata: session.metadata,
          
        });
        break;
      case 'checkout.session.expired':
        this.eventEmitter.emit('order.failed', session.id);
        break;
      case 'charge.refunded':
        this.eventEmitter.emit('order.refunded', session.payment_intent);
        break;
        case 'checkout.session.completed':
  console.log('🔔 Webhook recibido: checkout.session.completed', session.id);
  this.eventEmitter.emit('order.confirmed', {
    sessionId: session.id,
    metadata: session.metadata,
  });
  console.log('📤 Evento order.confirmed emitido');
  break;
    }

    return { received: true };
  }
}