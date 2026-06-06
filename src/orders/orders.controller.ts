import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';

import { CurrentUser } from '../common/decorators/current-user.decorator'; // 💡 Ajusta la ruta a tu proyecto
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateOrderDto } from './dto/create-order.dto'; // 📑 Importación de tu DTO aislado
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderStatus } from '../common/enums/order-status.enum';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Iniciar un proceso de compra (Crear orden PENDING)',
  })
  @ApiResponse({
    status: 201,
    type: Order,
    description: 'Orden creada exitosamente',
  })
  createOrder(
    @CurrentUser() user: { id: string },
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.createOrder(user.id, createOrderDto);
  }

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

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de una orden específica (Propietario)',
  })
  @ApiParam({ name: 'id', description: 'ID de la orden (UUID v4)' })
  @ApiResponse({
    status: 200,
    type: Order,
    description: 'Detalle de la orden encontrada',
  })
  findOrderByIdAndUser(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ): Promise<Order> {
    return this.ordersService.findOrderByIdAndUser(id, user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.PRODUCER)
  @ApiOperation({
    summary: 'Listar las órdenes de los eventos del productor autenticado',
  })
  @ApiQuery({
    name: 'status',
    enum: OrderStatus,
    required: false,
    description: 'Filtrar por estado de la transacción',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtrar por el ID de un cliente comprador específico',
  })
  @ApiResponse({
    status: 200,
    type: [Order],
    description: 'Lista filtrada de órdenes para el panel de administración',
  })
  findAllOrders(
    @CurrentUser() user: { id: string },
    @Query('status') status?: OrderStatus,
    @Query('userId') userId?: string,
  ): Promise<Order[]> {
    return this.ordersService.findAllOrders(user.id, status, userId);
  }
}
