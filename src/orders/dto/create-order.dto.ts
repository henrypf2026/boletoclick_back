import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description:
      'ID único de la localidad (TicketType) que el usuario seleccionó para asistir',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @IsUUID()
  ticketTypeId!: string;

  @ApiProperty({
    description:
      'Cantidad de tiquetes que el usuario va a comprar para esa localidad',
    example: 2,
  })
  @IsInt()
  @Min(1, { message: 'Debes comprar al menos 1 tiquete' })
  quantity!: number;

  @ApiProperty({
    description:
      'ID del cupón de descuento (opcional, por si el usuario tiene un código promocional)',
    example: 'f9e8d7c6-b5a4-3p2o-1n0m-9l8k7j6i5h4g',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  couponId?: string;
}
