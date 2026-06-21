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
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';

@Controller('payments')
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

  @UseGuards(SupabaseAuthGuard)
  @Post('create-session')
  async createCheckoutSession(
    @Req() req: any,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<{ url: string; expiresAt: Date; sessionId: string }> {
    // userId viene del JWT — el frontend no puede falsificarlo
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuario no autenticado');

    // Pasamos userId del token; el service recalcula el total desde la DB
    const session = await this.stripeService.createCheckoutSession({
      ticketTypeId: dto.ticketTypeId,
      quantity: dto.quantity,
      couponId: dto.couponId,
      userId,
    });
    return {
      url: session.url,
      expiresAt: session.expiresAt,
      sessionId: session.sessionId,
    };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('verify/:sessionId')
  async verifySession(
    @Param('sessionId')
    sessionId: string,
  ): Promise<{ valid: boolean }> {

    const valid = await this.stripeService.verifySession(sessionId);
    return { valid };
  }

  // Sin guard — Stripe no manda JWT.
  // La autenticidad se verifica con la firma STRIPE_WEBHOOK_SECRET.
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    console.log('🔔 Webhook recibido raw');
    console.log('rawBody exists:', !!req.rawBody);

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    await this.stripeService.handleWebhookEvent(rawBody, signature);
    return { received: true };
  }
}
