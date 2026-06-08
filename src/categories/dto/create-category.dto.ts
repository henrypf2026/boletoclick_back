import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
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
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must be lowercase, alphanumeric, and separated only by hyphens (e.g., stand-up-comedy)',
  })
  @MinLength(2)
  slug!: string;

}