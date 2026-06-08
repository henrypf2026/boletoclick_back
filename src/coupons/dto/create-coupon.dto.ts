import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDate,
  MinDate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { DiscountType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiPropertyOptional({
    example: 'd3b07384-d113-4956-a5d1-2816442c059d',
    description: 'ID del evento específico. Si se omite, el cupón será global.',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El eventId debe ser un UUID válido v4.' })
  eventId?: string;

  @ApiProperty({
    example: 'ROCK2026',
    description:
      'Código único del cupón. Se transformará automáticamente a mayúsculas y sin espacios.',
  })
  @IsNotEmpty({ message: 'El código del cupón es requerido.' })
  @IsString({ message: 'El código debe ser una cadena de texto.' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  code!: string;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description:
      'Tipo de descuento: PERCENTAGE (porcentaje) o FIXED (monto fijo).',
  })
  @IsNotEmpty({ message: 'El tipo de descuento es requerido.' })
  @IsEnum(DiscountType, {
    message: 'El tipo de descuento debe ser PERCENTAGE o FIXED.',
  })
  discountType!: DiscountType;

  @ApiProperty({
    example: 15.0,
    description: 'Valor del descuento. Debe ser un número positivo.',
  })
  @IsNotEmpty({ message: 'El valor del descuento es requerido.' })
  @IsNumber({}, { message: 'El valor del descuento debe ser un número.' })
  @IsPositive({ message: 'El valor del descuento debe ser mayor a cero.' })
  discountValue!: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description:
      'Fecha y hora de expiración en formato ISO. Debe ser una fecha futura.',
  })
  @IsNotEmpty({ message: 'La fecha de expiración es requerida.' })
  @Type(() => Date)
  @IsDate({ message: 'Debe ser una fecha válida.' })
  @MinDate(new Date(), {
    message: 'La fecha de expiración debe ser en el futuro.',
  })
  expiresAt!: Date;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el cupón se crea activo o apagado manualmente.',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano.' })
  isActive?: boolean;
}
