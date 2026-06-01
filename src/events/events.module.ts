import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsRepository } from './events.repository';
import { TicketTypesModule } from '../ticket-types/ticket-types.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    TicketTypesModule,
    SupabaseModule,
    UsersModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
})
export class EventsModule {}
