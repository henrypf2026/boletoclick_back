import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsUrl,
  MinLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '../entities/event.entity';
import { CreateTicketTypeDto } from '../../ticket-types/dto/create-ticket-type.dto';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({
    description: 'The title or commercial name of the event',
    example: 'Cosquín Rock Colombia 2026',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the festival, line-up, rules, etc.',
    example: 'The biggest rock festival returns with a killer line-up...',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'The UUID of the physical venue where the show takes place',
    example: 'b4a1c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  venueId!: string;

  @ApiProperty({
    description: 'The UUID of the musical category/genre',
    example: 'c7b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({
    description:
      'The exact date and time when the event starts (ISO 8601 format)',
    example: '2026-10-15T20:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  eventDate!: string;

  @ApiPropertyOptional({
    description: 'The current lifecycle status of the event',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiProperty({
    description: 'Array of ticket types to be created along with the event',
    type: [CreateTicketTypeDto], // 💡 Así Swagger sabe qué estructura tiene el array
  })
  @IsArray()
  @ValidateNested({ each: true }) // 🕵️‍♂️ Inspecciona cada elemento del array
  @Type(() => CreateTicketTypeDto) // 🔄 Convierte el JSON plano a la clase del DTO
  ticketTypes!: CreateTicketTypeDto[];
}
