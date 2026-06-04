import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Música',
    description: 'Nombre único de la categoría',
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    example: 'musica',
    description: 'Slug único para URLs amigables',
  })
  @IsString()
  @MinLength(2)
  slug!: string;

  @ApiPropertyOptional({
    example: 'Eventos musicales de todo tipo',
    description: 'Descripción opcional de la categoría',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si la categoría está activa. Por defecto true.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}