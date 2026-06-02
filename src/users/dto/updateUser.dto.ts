import {
  IsString, IsOptional, IsDateString,
  IsUrl, MinLength, MaxLength,
  Matches, ValidateNested, IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum AccountType {
  SAVINGS  = 'savings',
  CHECKING = 'checking',
}

export class BankInfoDto {
  @IsString() @MaxLength(100)
  accountHolder: string;

  @IsString() @MaxLength(20)
  documentOrNit: string;

  @IsString() @MaxLength(80)
  bankName: string;

  @IsEnum(AccountType)
  accountType: AccountType;

  @IsString() @Matches(/^\d{6,20}$/)
  accountNumber: string;
}

/**
 * Todos los campos son opcionales en el DTO porque
 * el endpoint soporta upsert parcial.
 * La validación de "campos requeridos según rol" se
 * delega al ProfileCompleteGuard, no al DTO.
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Rocío Arias' })
  @IsOptional() @IsString()
  @MinLength(2) @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({ example: '1998-05-14' })
  @IsOptional() @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsOptional() @IsUrl()
  avatarUrl?: string;

  // Solo presente si el usuario tiene rol producer
  @ApiPropertyOptional({ type: () => BankInfoDto })
  @IsOptional() @ValidateNested()
  @Type(() => BankInfoDto)
  bankInfo?: BankInfoDto;
}