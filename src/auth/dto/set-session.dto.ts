import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SetSessionDto {
  @ApiProperty({
    description: 'Access token generado por Supabase OAuth',
  })
  @IsString()
  @MinLength(10)
  access_token!: string;
}
