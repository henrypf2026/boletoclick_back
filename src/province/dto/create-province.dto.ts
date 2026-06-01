import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProvinceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @Type(() => Number)
  provinceCode!: number;
}
