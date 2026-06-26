import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Coupons (Cupones de Descuento)')
@ApiBearerAuth()
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo cupón (Solo Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Cupón creado con éxito.',
    type: Coupon,
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para realizar esta acción.',
  })
  @ApiBody({ type: CreateCouponDto })
  createCoupon(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.createCoupon(createCouponDto);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener el listado de todos los cupones (Solo Admin)',
  })
  @ApiResponse({ status: 200, type: [Coupon] })
  getAllCoupons() {
    return this.couponsService.getAllCoupons();
  }

  @Get('validate/:code')
  @ApiOperation({
    summary: 'Validar un código de cupón en el checkout (Público)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cupón válido y listo para aplicar.',
    type: Coupon,
  })
  @ApiResponse({
    status: 404,
    description: 'Cupón inválido, vencido o apagado.',
  })
  getValidCouponByCode(@Param('code') code: string) {
    return this.couponsService.getValidCouponByCode(code);
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obtener un cupón específico por su ID (Solo Admin)',
  })
  @ApiResponse({ status: 200, type: Coupon })
  getCouponById(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.getCouponById(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar parcialmente un cupón (Solo Admin)' })
  @ApiResponse({ status: 200, type: Coupon })
  @ApiBody({ type: UpdateCouponDto })
  updateCoupon(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponsService.updateCoupon(id, updateCouponDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Desactivar lógicamente un cupón del sistema (Solo Admin)',
  })
  @ApiResponse({ status: 200, description: 'Cupón desactivado exitosamente.' })
  deactivateCoupon(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.deactivateCoupon(id);
  }
}
