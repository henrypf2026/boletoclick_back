import { PartialType, OmitType } from '@nestjs/swagger';
import { RegisterDto } from './register.dto'; // Asegúrate de que la ruta sea correcta

export class UpdateUserDto extends PartialType(
  OmitType(RegisterDto, ['email', 'password'] as const),
) {}
