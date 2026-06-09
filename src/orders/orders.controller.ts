import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  ApiBearerAuth,
  ApiOperation,
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
}
