import {
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    IsDateString,
    MinLength,
    IsArray,
    ValidateNested,
    Allow,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTicketTypeDto } from '../../ticket-types/dto/create-ticket-type.dto';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsValidEventDate } from '../../common/decorators/is-valid-event-date.decorator';
import { EventStatus } from '../../common/enums/event-status.enum';

export class UpdateEventDto {
    @ApiPropertyOptional({
        description: 'The title or commercial name of the event',
        example: 'Cosquín Rock Colombia 2026',
        minLength: 3,
    })
    @IsString()
    @IsOptional()
    @MinLength(3)
    title?: string;

    @ApiPropertyOptional({
        description: 'Detailed description of the festival, line-up, rules, etc.',
        example: 'The biggest rock festival returns with a killer line-up...',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'The UUID of the physical venue where the show takes place',
        example: 'b4a1c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsUUID()
    @IsOptional()
    venueId?: string;

    @ApiPropertyOptional({
        description: 'The UUID of the musical category/genre',
        example: 'c7b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional({
        description: 'La fecha y hora exacta de inicio del evento (Formato ISO 8601).',
        example: '2026-12-31T22:00:00.000Z',
    })
    @IsDateString(
        {},
        {
            message: 'La fecha del evento debe ser un string en formato ISO 8601 válido.',
        },
    )
    @IsOptional()
    @IsValidEventDate()
    eventDate?: string;

    @ApiPropertyOptional({
        description: 'The current lifecycle status of the event',
        enum: EventStatus,
        default: EventStatus.DRAFT,
    })
    @IsEnum(EventStatus)
    @IsOptional()
    status?: EventStatus;

    @ApiPropertyOptional({
        description: 'List of ticket types available for this event',
        type: [CreateTicketTypeDto],
    })
    @Transform(({ value }) => {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return plainToInstance(CreateTicketTypeDto, parsed);
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateTicketTypeDto)
    ticketTypes?: CreateTicketTypeDto[];

    @ApiPropertyOptional({
        type: 'string',
        format: 'binary',
        description: 'Imagen en formato .jpg,.png,.gif,.webp,.jpeg. No mayor a 2MB',
    })
    @Allow()
    @IsOptional()
    poster?: any;
}