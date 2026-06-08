import { Module } from '@nestjs/common';
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
