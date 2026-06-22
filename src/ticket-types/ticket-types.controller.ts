import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { TicketTypesService } from './ticket-types.service';
import { TicketType } from './entities/ticket-type.entity';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Ticket Types')
@Controller('ticket-types')
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Get('by-event/:eventId')
  @ApiOperation({ summary: 'Obtener tipos de ticket por evento' })
  @ApiParam({ name: 'eventId', description: 'UUID del evento' })
  @ApiResponse({ status: 200, type: [TicketType] })
  getByEvent(@Param('eventId') eventId: string): Promise<TicketType[]> {
    return this.ticketTypesService.getTicketTypesByEvent(eventId);
  }

  @Get('by-zone/:zone')
  @ApiOperation({ summary: 'Obtener tipos de ticket por zona' })
  @ApiParam({ name: 'zone', description: 'Nombre de la zona' })
  @ApiResponse({ status: 200, type: [TicketType] })
  getByZone(@Param('zone') zone: string): Promise<TicketType[]> {
    return this.ticketTypesService.getTicketTypesByZone(zone);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de ticket por ID' })
  @ApiParam({ name: 'id', description: 'UUID del ticket type' })
  @ApiResponse({ status: 200, type: TicketType })
  getById(@Param('id') id: string): Promise<TicketType> {
    return this.ticketTypesService.getTicketTypeById(id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PRODUCER)
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un tipo de ticket (ADMIN o PRODUCER)' })
  @ApiParam({ name: 'id', description: 'UUID del ticket type' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  deactivate(@Param('id') id: string): Promise<void> {
    return this.ticketTypesService.deactivateTicketType(id);
  }
}