import { forwardRef, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsRepository } from './events.repository';
import { OwnerGuard } from '../common/guards/owner.guard';
import { TicketTypesModule } from '../ticket-types/ticket-types.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { UsersModule } from '../users/users.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { VenuesModule } from '../venues/venues.module';
import { EmailModule } from '../email/email.module';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { User } from '../users/entities/user.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, User, Ticket, Order]),
    TicketTypesModule,
    SupabaseModule,
    UsersModule,
    FileUploadModule,
    VenuesModule,
    forwardRef(() => EmailModule),
  ],
  controllers: [EventsController, AdminStatsController],
  providers: [EventsService, EventsRepository, OwnerGuard, AdminStatsService],
  exports: [EventsService],
})
export class EventsModule {}
