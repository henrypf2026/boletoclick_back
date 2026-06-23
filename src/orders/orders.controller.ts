import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { Order } from './entities/order.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obtener el historial de compras del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    type: [Order],
    description: 'Historial de órdenes del cliente',
  })
  findMyOrders(@CurrentUser() user: { id: string }): Promise<Order[]> {
    return this.ordersService.findMyOrders(user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar una orden de compra del usuario autenticado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la orden a cancelar',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden cancelada exitosamente',
  })
  cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ): Promise<{ message: string }> {
    return this.ordersService.cancelOrder(id, user.id);
  }
}
