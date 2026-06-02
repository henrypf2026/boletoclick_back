import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketTypeDto {
  @ApiProperty({
    description: 'Name of the ticket category or location',
    example: 'VIP Platea Delantera',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Base price of the ticket before ticketing service fees',
    example: 85000.0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price can look like 85000.55 (max 2 decimal places)' },
  )
  @IsNotEmpty()
  @Min(0)
  price!: number;

  @ApiProperty({
    description: 'Total amount of tickets available for sale in this category',
    example: 500,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  stock!: number;

  @ApiPropertyOptional({
    description: 'Physical location or specific sector within the venue',
    example: 'Second Floor - Western Zone',
  })
  @IsString()
  @IsOptional()
  zone?: string;
}
