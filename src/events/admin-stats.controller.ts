import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AdminStatsService } from './admin-stats.service';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard-metrics')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Obtener métricas reales e infraestructura para el dashboard de Admin',
  })
  async getMetrics() {
    return await this.adminStatsService.getDashboardStats();
  }

  @Get('finanzas/comision')
  @ApiOperation({
    summary: 'Obtener la comisión global actual de la plataforma',
  })
  getComision() {
    return this.adminStatsService.getComision();
  }

  @Put('finanzas/comision')
  @ApiOperation({ summary: 'Actualizar la comisión global de la plataforma' })
  @ApiBody({
    description: 'Nuevo porcentaje de comisión de la plataforma.',
    schema: {
      type: 'object',
      properties: {
        fee: {
          type: 'number',
          example: 10,
          description: 'Porcentaje de comisión',
        },
      },
      required: ['fee'],
    },
  })
  updateComision(@Body('fee') fee: number) {
    return this.adminStatsService.updateComision(fee);
  }

  @Get('finanzas/balances')
  @ApiOperation({
    summary: 'Obtener el desglose de balances y recaudación por productor',
  })
  async getBalances() {
    return await this.adminStatsService.getBalancesFinancieros();
  }

  @Post('finanzas/liquidar')
  @ApiOperation({
    summary: 'Marcar los fondos de un productor como liquidados',
  })
  @ApiBody({
    description:
      'Correo electrónico del productor cuyos fondos serán liquidados.',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'productor@boletoclick.com',
          description: 'Correo electrónico del productor',
        },
      },
      required: ['email'],
    },
  })
  liquidarProductor(@Body('email') email: string) {
    return this.adminStatsService.liquidarProductor(email);
  }
}
