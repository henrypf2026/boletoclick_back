import { IsUUID, IsInt, IsPositive, IsNumber, IsOptional } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  ticketTypeId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  total!: number;

  @IsOptional()
  @IsUUID()
  couponId?: string;
}