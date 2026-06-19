import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { Order } from '../orders/entities/order.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { SupabaseModule } from '../supabase/supabase.module';
import { TicketLocksModule } from '../ticket-locks/ticket-locks.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Order, TicketType]),
    SupabaseModule,
    TicketLocksModule,
  ],
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
  ],
  exports: [StripeService],
})
export class StripeModule {}
