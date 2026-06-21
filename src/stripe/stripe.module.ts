import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { Order } from '../orders/entities/order.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { SupabaseModule } from '../supabase/supabase.module';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { TicketLocksModule } from '../ticket-locks/ticket-locks.module';
=======
import { TicketsService } from '../tickets/tickets.service';
import { Ticket } from '../tickets/entities/ticket.entity';
import { TicketsRepository } from '../tickets/tickets.repository';
>>>>>>> Stashed changes
=======
import { TicketsService } from '../tickets/tickets.service';
import { Ticket } from '../tickets/entities/ticket.entity';
import { TicketsRepository } from '../tickets/tickets.repository';
>>>>>>> Stashed changes

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Order, TicketType, Ticket]),
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
    TicketsService,
    TicketsRepository,
  ],
  exports: [StripeService],
})
export class StripeModule {}
