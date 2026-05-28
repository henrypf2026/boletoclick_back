import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'mauricioruiz@gmail.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'Mauricio Ruiz',
    description: 'Nombre completo del usuario',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: '1995-05-10',
    description: 'Fecha de nacimiento',
  })
  @IsDateString()
  birthDate!: string;

  @ApiProperty({
    example: 'ABC123456',
    description: 'Número de documento',
  })
  @IsString()
  documentNumber!: string;

  @ApiProperty({
    example: 'https://my-image.com/profile.jpg',
    description: 'URL de imagen de perfil',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiProperty({
    example: true,
    description: 'Acepta recibir newsletter',
  })
  @IsBoolean()
  allowNewsletter!: boolean;

  @ApiProperty({
    example: 'Eventos Mauricio',
    description: 'Nombre del negocio/productora',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessName?: string;
}
