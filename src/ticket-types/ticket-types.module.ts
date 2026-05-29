import { Module } from '@nestjs/common';
import { TicketTypesService } from './ticket-types.service';
import { TicketTypesController } from './ticket-types.controller';
import { TicketTypesRepository } from './ticket-types.repository';
import { TicketType } from './entities/ticket-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TicketType])],
  controllers: [TicketTypesController],
  providers: [TicketTypesService, TicketTypesRepository],
  exports: [TicketTypesRepository],
})
export class TicketTypesModule {}
