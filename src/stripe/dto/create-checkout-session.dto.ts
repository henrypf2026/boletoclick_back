import { IsUUID, IsInt, IsPositive, IsOptional } from 'class-validator';

export class CreateCheckoutSessionDto {
  

  @IsUUID()
  ticketTypeId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsUUID()
  couponId?: string;
}