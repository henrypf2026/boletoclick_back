import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class createTicketsDto {
  @ApiProperty({
    description: 'Id identificador de la orden de la base de datos',
    example: '61c713b1-8b77-44a6-9f79-66bf961726a2',
  })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({
    description: 'Id identificador de la tipo de ticket',
    example: '61c713b1-8b77-44a6-9f79-66bf961726a2',
  })
  @IsString()
  @IsNotEmpty()
  ticketTypeId!: string;

  @ApiProperty({
    description: 'Cantidad de boletos comprados',
    example: '5',
  })
  @IsString()
  @IsNotEmpty()
  quantity!: string;
}
