import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BankAccountType {
  SAVINGS = 'SAVINGS',
  CHECKING = 'CHECKING',
}

@Entity('bank_accounts')
export class BankAccount {
  @ApiProperty({
    description: 'Unique identifier of the bank account (UUID)',
    example: 'd3b07384-d113-49cd-a5d7-9c0d1e2f3a4b',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'The ID of the producer user who owns this bank account',
    example: 'e4f5g6h7-89ab-cdef-0123-456789abcdef',
  })
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @ApiProperty({
    description: 'The name of the banking or financial institution',
    example: 'Bancolombia',
  })
  @Column({ name: 'bank_name', type: 'varchar', length: 255 })
  bankName!: string;

  @ApiProperty({
    description: 'The type of the bank account (Savings or Checking)',
    enum: BankAccountType,
    example: BankAccountType.SAVINGS,
  })
  @Column({
    name: 'account_type',
    type: 'enum',
    enum: BankAccountType,
  })
  accountType!: BankAccountType;

  @ApiProperty({
    description:
      'The physical bank account number (stored as string to preserve leading zeros)',
    example: '00112233445',
  })
  @Column({ name: 'account_number', type: 'varchar', length: 50 })
  accountNumber!: string;

  @ApiProperty({
    description: 'The full name of the bank account holder',
    example: 'Juan Pablo Hormiga Leal',
  })
  @Column({ name: 'holder_name', type: 'varchar', length: 255 })
  holderName!: string;

  @ApiProperty({
    description:
      'The identification document or tax ID (NIT) of the account holder',
    example: '1020304050',
  })
  @Column({ name: 'holder_document', type: 'varchar', length: 50 })
  holderDocument!: string;

  @ApiProperty({
    description: 'The timestamp when the bank account record was created',
    example: '2026-05-27T23:40:19.000Z',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({
    description: 'The timestamp when the bank account record was last updated',
    example: '2026-05-27T23:55:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
