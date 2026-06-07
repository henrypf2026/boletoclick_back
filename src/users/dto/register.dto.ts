import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum'; // 💡 Sincronizado con el path del AuthController

export class RegisterDto {
  @ApiProperty({
    example: 'mauricioruiz@gmail.com',
    description: 'Correo electrónico único del usuario',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'Contraseña para la cuenta (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'Mauricio Ruiz',
    description: 'Nombre completo del usuario o representante legal',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: '1995-05-10',
    description:
      'Fecha de nacimiento (YYYY-MM-DD) para validar mayoría de edad',
  })
  @IsDateString()
  birthDate!: string;

  @ApiPropertyOptional({
    example: '10203040-5',
    description:
      'Número de documento o NIT. Obligatorio para Productores, opcional para compradores.',
  })
  @IsOptional() // 👈 ¡Crucial! Evita que los compradores comunes queden bloqueados al registrarse
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({
    description:
      'Rol asignado al usuario. Si no se envía, por defecto será USER.',
    enum: Role,
    default: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/boletoclick/image/upload/profile.jpg',
    description: 'URL de la imagen de perfil alojada en Cloudinary',
  })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario acepta recibir el newsletter comercial',
  })
  @IsBoolean()
  allowNewsletter!: boolean;

  @ApiPropertyOptional({
    example: 'Eventos Mauricio S.A.S.',
    description:
      'Razón social o nombre comercial de la productora. Solo aplica para rol Producer.',
  })
  @IsOptional()
  @IsString()
  businessName?: string;
}
