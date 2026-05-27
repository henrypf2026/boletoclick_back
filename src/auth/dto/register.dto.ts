import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@gmail.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'Contraseña del usuario',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
