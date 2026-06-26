import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  Body,
  Post,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ScanTicketDto } from './dto/scan-ticket.dto';
import { createTicketsDto } from './dto/createTicketsDto';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // ── Rutas literales primero ──────────────────────────────────────────

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Obtener los tiquetes del usuario autenticado' })
  @ApiResponse({
    status: 200,
    type: [Ticket],
    description: 'Lista de tiquetes del cliente actual',
  })
  findMyTickets(@Req() req: any): Promise<Ticket[]> {
    const userId = req.user.id;
    return this.ticketsService.findTicketsByUser(userId);
  }

  @Get('event/:eventId/stats')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.SCANNER, Role.ADMIN, Role.PRODUCER)
  @ApiOperation({
    summary: 'Stats de asistencia de un evento — SCANNER, ADMIN, PRODUCER',
  })
  @ApiParam({ name: 'eventId', description: 'UUID del evento' })
  @ApiResponse({
    status: 200,
    description: 'Total, llegados, pendientes y porcentaje de asistencia',
    schema: {
      example: { total: 120, arrived: 47, pending: 73, percentage: 39.2 },
    },
  })
  getEventStats(@Param('eventId') eventId: string): Promise<{
    total: number;
    arrived: number;
    pending: number;
    percentage: number;
  }> {
    return this.ticketsService.getEventStats(eventId);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER, Role.ADMIN)
  @ApiOperation({
    summary: 'Listar tiquetes — PRODUCER ve los suyos, ADMIN ve todos',
  })
  findAllTickets(
    @CurrentUser() user: { id: string; role: Role },
    @Query('orderId') orderId?: string,
  ): Promise<Ticket[]> {
    if (user.role === Role.ADMIN) {
      return this.ticketsService.findAllTickets(orderId);
    }
    return this.ticketsService.findAllTicketsByProducer(user.id, orderId);
  }

  @Post('scan')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.SCANNER, Role.ADMIN, Role.PRODUCER)
  @ApiOperation({ summary: 'Escanear un ticket para validar acceso al evento' })
  @ApiResponse({ status: 200, description: 'Ticket válido — acceso permitido' })
  @ApiResponse({ status: 400, description: 'Ticket ya usado o inválido' })
  @ApiResponse({ status: 403, description: 'Sin permiso para escanear este evento' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  @ApiBody({
    description: 'Código QR del ticket a escanear',
    type: ScanTicketDto,
  })
  scanTicket(
    @Body() dto: ScanTicketDto,
    @CurrentUser() user: { id: string; role: Role },
  ): Promise<{ message: string; ticket: Ticket }> {
    return this.ticketsService.scanTicket(dto.qrCode, user, dto.eventId);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER, Role.PRODUCER)
  @ApiOperation({ summary: 'Generacíon de tickets' })
  @ApiBody({
    description: 'Datos para la creación de tickets en lote',
    type: createTicketsDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket generados',
    type: Ticket,
    isArray: true,
  })
  createBulkTickets(
    @Body()
    createTicketsDto: createTicketsDto,
  ) {
    return this.ticketsService.createBulkTickets(createTicketsDto);
  }

  // ── Rutas con parámetro dinámico al final ───────────────────────────

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Obtener el detalle de un tiquete específico' })
  @ApiParam({
    name: 'id',
    description: 'ID del tiquete (UUID v4)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    type: Ticket,
    description: 'Detalle del tiquete encontrado',
  })
  findTicketByIdAndUser(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ): Promise<Ticket> {
    return this.ticketsService.findTicketByIdAndUser(id, user.id);
  }
}
