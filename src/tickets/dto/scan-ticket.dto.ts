import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ScanTicketDto {
  @ApiProperty({
    description: 'Código QR del ticket a escanear',
    example: 'CLICK-TICKET-abc123-1-4521',
  })
  @IsString()
  @IsNotEmpty()
  qrCode!: string;
}