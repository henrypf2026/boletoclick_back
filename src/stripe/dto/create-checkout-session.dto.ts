import { IsString, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  id!: string;

  @IsString()
  userId!: string;

  @IsString()
  eventId!: string;

  @IsString()
  eventTitle!: string;

  @IsString()
  venue!: string;

  @IsString()
  date!: string;

  @IsString()
  time!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @Min(1)
  total!: number;

  @IsString()
  qrCode!: string;

  @IsString()
  purchasedAt!: string;
}