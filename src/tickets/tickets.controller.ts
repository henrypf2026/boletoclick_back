import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

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

  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
  @ApiOperation({
    summary: 'Listar los tiquetes de los eventos del productor autenticado',
  })
  findAllTickets(
    @CurrentUser() user: { id: string }, // 🔥 Capturamos al productor de forma segura
    @Query('orderId') orderId?: string,
  ): Promise<Ticket[]> {
    // 🔥 Le pasamos su ID al servicio para bloquear el acceso al resto del universo
    return this.ticketsService.findAllTicketsByProducer(user.id, orderId);
  }
}
