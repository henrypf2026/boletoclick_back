import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BankAccountType } from '../entities/bank-account.entity';

export class CreateBankAccountDto {
  @ApiProperty({
    description: 'The name of the banking or financial institution',
    example: 'Bancolombia',
  })
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({
    description: 'The type of the bank account (Savings or Checking)',
    enum: BankAccountType,
    example: BankAccountType.SAVINGS,
  })
  @IsEnum(BankAccountType)
  @IsNotEmpty()
  accountType!: BankAccountType;

  @ApiProperty({
    description:
      'The physical bank account number (must be a string to preserve leading zeros)',
    example: '00112233445',
  })
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiProperty({
    description: 'The full name of the bank account holder',
    example: 'Juan Pablo Hormiga Leal',
  })
  @IsString()
  @IsNotEmpty()
  holderName!: string;

  @ApiProperty({
    description:
      'The identification document or tax ID (NIT) of the account holder',
    example: '1020304050',
  })
  @IsString()
  @IsNotEmpty()
  holderDocument!: string;
}
