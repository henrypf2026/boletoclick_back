import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketLocksService } from './ticket-locks.service';
import { TicketLocksController } from './ticket-locks.controller';
import { TicketLocksRepository } from './ticket-locks.repository';
import { TicketLock } from './entities/ticket-lock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketLock])],
  controllers: [TicketLocksController],
  providers: [TicketLocksService, TicketLocksRepository],
  exports: [TicketLocksService],
})
export class TicketLocksModule {}
