import { Controller, Get, Param, Delete } from '@nestjs/common';
import { TicketTypesService } from './ticket-types.service';
import { TicketType } from './entities/ticket-type.entity';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

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

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un tipo de ticket' })
  @ApiParam({ name: 'id', description: 'UUID del ticket type' })
  @ApiResponse({ status: 200 })
  deactivate(@Param('id') id: string): Promise<void> {
    return this.ticketTypesService.deactivateTicketType(id);
  }
}