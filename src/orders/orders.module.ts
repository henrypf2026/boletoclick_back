import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { TicketsModule } from '../tickets/tickets.module';
import { OrdersRepository } from './orders.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    SupabaseModule,
    UsersModule,
    EmailModule,
    TicketsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
