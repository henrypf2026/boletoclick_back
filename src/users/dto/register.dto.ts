import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum'; // 💡 Sincronizado con el path del AuthController
import { IsAdult } from '../../common/decorators/is-adult.decorator';

export class RegisterDto {
  @ApiProperty({
    example: 'mauricioruiz@gmail.com',
    description: 'Correo electrónico único del usuario',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Aa12345*',
    description:
      'Contraseña de la cuenta (mínimo 8 caracteres, debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial)',
  })
  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-]).+$/,
    {
      message:
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.',
    },
  )
  password!: string;

  @ApiProperty({
    example: 'Mauricio Ruiz',
    description: 'Nombre completo del usuario o representante legal',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: '2005-05-10',
    description:
      'Fecha de nacimiento (YYYY-MM-DD). Validación de mayoría de edad (mínimo 18 años).',
  })
  @IsDateString(
    {},
    {
      message:
        'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD).',
    },
  )
  @IsAdult(18)
  birthDate!: string;

  @ApiPropertyOptional({
    example: '10203040-5',
    description:
      'Número de documento o NIT. Obligatorio para Productores, opcional para compradores.',
  })
  @IsOptional()
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
