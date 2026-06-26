import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class ScanTicketDto {
  @ApiPropertyOptional({
    description: 'JWT del ticket o contenido crudo del QR',
  })
  @ValidateIf((dto: ScanTicketDto) => !dto.ticketId)
  @IsString()
  qrCode?: string;

  @ApiPropertyOptional({
    description: 'UUID del ticket — usado cuando el QR es una URL /entradas/:id',
  })
  @ValidateIf((dto: ScanTicketDto) => !dto.qrCode)
  @IsUUID()
  ticketId?: string;

  @ApiPropertyOptional({
    description: 'UUID del evento — valida que el ticket pertenezca a ese show',
  })
  @IsOptional()
  @IsUUID()
  eventId?: string;
}
