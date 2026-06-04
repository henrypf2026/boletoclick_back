import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common'; // 👈 import type
import type { Request } from 'express';               // 👈 import type
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

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
  handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ): { received: boolean } {
    if (!req.rawBody) {                              // 👈 guard para undefined
      throw new BadRequestException('Missing raw body');
    }

    const event = this.stripeService.constructWebhookEvent(
      req.rawBody,
      signature,
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        break;
      case 'payment_intent.payment_failed':
        break;
    }

    return { received: true };
  }
}