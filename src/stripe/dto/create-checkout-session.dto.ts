import { IsString, IsNumber, IsPositive, IsUUID, IsOptional } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsUUID()
  userId!: string;

  @IsUUID()
  eventId!: string;

  @IsString()
  eventTitle!: string;

  @IsString()
  venue!: string;

  @IsString()
  date!: string;

  @IsString()
  time!: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  total!: number;

  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsOptional()
  @IsString()
  purchasedAt?: string;
}