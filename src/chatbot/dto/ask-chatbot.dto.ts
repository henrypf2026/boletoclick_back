import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AskChatbotDto {
  @ApiProperty({
    example: '¿Qué eventos hay disponibles?',
    description: 'Pregunta que el usuario le hace al chatbot',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'La pregunta no puede estar vacía' })
  @MaxLength(500, {
    message: 'La pregunta no puede tener más de 500 caracteres',
  })
  message!: string;
}
