import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ScanTicketDto {
  @ApiProperty({
    description: 'Código QR del ticket a escanear',
    example: 'CLICK-TICKET-abc123-1-4521',
  })
  @IsString()
  @IsNotEmpty()
  qrCode!: string;

  @ApiPropertyOptional({
    description: 'UUID del evento — valida que el ticket pertenezca a ese show',
  })
  @IsOptional()
  @IsUUID()
  eventId?: string;
}