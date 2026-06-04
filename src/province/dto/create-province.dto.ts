import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProvinceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @IsString()
  provinceCode!: string;
}
