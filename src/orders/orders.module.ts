import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/orders.entity';
import { OrderItem } from './entities/orders-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, TicketType]),
    StripeModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
=======
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersRepository } from './orders.repository';
import { SupabaseModule } from '../supabase/supabase.module'; // 💡 Ajusta según tu árbol de carpetas
import { UsersModule } from '../users/users.module'; // 💡 Ajusta según tu árbol de carpetas
import { TicketTypesModule } from '../ticket-types/ticket-types.module';
import { TicketsModule } from '../tickets/tickets.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    SupabaseModule,
    UsersModule,
    TicketTypesModule,
    TicketsModule,
    CouponsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
>>>>>>> 979f4138f8e69a55bc78157a1650cbc480bf2bbc
