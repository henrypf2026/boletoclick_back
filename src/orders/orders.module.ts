import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Ticket } from '../tickets/entities/ticket.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Ticket, TicketType]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}