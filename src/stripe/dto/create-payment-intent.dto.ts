import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;
}