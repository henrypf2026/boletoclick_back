import { Module } from '@nestjs/common';
import { TicketTypesService } from './ticket-types.service';
import { TicketTypesController } from './ticket-types.controller';
import { TicketTypesRepository } from './ticket-types.repository';
import { TicketType } from './entities/ticket-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([TicketType]), UsersModule],
  controllers: [TicketTypesController],
  providers: [TicketTypesService, TicketTypesRepository, RolesGuard],
  exports: [TicketTypesService],
})
export class TicketTypesModule {}