import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (config: ConfigService) => {
        const key = config.get<string>('STRIPE_SECRET_KEY');
        if (!key) throw new Error('STRIPE_SECRET_KEY no está definida en .env');
        return new Stripe(key, { apiVersion: '2026-05-27.dahlia' });
      },
      inject: [ConfigService],
    },
    StripeService,
    EventEmitter2, 
  ],
  exports: [StripeService],
})
export class StripeModule {}