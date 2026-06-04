import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

/**
 * UpdateUserDto — Actualiza el perfil de un usuario.
 *
 * Se usa en dos escenarios:
 *  1. El usuario se registró via OAuth (Google, etc.) y necesita completar sus datos
 *     antes de comprar una boleta.
 *  2. Un Producer necesita completar su perfil (documentNumber, businessName)
 *     antes de crear un evento.
 *
 * Todos los campos son opcionales para soportar actualizaciones parciales,
 * pero el servicio/guard que consuma este DTO puede validar que ciertos
 * campos estén presentes según el rol o la acción que se intenta realizar.
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Mauricio Ruiz',
    description: 'Nombre completo del usuario o representante legal',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '1995-05-10',
    description: 'Fecha de nacimiento (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    example: '10203040-5',
    description:
      'Número de documento o NIT. Requerido para Producers antes de crear un evento.',
  })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({
    example: 'Eventos Mauricio S.A.S.',
    description:
      'Razón social o nombre comercial. Requerido para Producers antes de crear un evento.',
  })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/boletoclick/image/upload/profile.jpg',
    description: 'URL de la imagen de perfil alojada en Cloudinary',
  })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el usuario acepta recibir el newsletter comercial',
  })
  @IsOptional()
  @IsBoolean()
  allowNewsletter?: boolean;

  @ApiPropertyOptional({
    description: 'Rol del usuario. Solo debe enviarse en flujos administrativos.',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}