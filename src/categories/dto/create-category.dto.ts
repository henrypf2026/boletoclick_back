import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The commercial and visible name of the category',
    example: 'Rock & Metal',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description:
      'The URL-friendly formatted version of the name (lowercase, hyphens instead of spaces)',
    example: 'rock-and-metal',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must be lowercase, alphanumeric, and separated only by hyphens (e.g., stand-up-comedy)',
  })
  slug!: string;
}
