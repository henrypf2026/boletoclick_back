import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';

@Injectable()
export class BankAccountsRepository {
  constructor(
    @InjectRepository(BankAccount)
    private readonly ormBankAccountsRepository: Repository<BankAccount>,
  ) {}

  async getAllBankAccounts(): Promise<BankAccount[]> {
    return await this.ormBankAccountsRepository.find();
  }

  async getBankAccountById(id: string): Promise<BankAccount> {
    const foundAccount = await this.ormBankAccountsRepository.findOne({
      where: { id },
    });

    if (!foundAccount) {
      throw new NotFoundException(`Bank account with id ${id} not found`);
    }

    return foundAccount;
  }

  async getBankAccountByUserId(userId: string): Promise<BankAccount> {
    const foundAccount = await this.ormBankAccountsRepository.findOne({
      where: { userId },
    });

    if (!foundAccount) {
      throw new NotFoundException(
        `Bank account for user with id ${userId} not found`,
      );
    }

    return foundAccount;
  }

  async upsertBankAccount(
    userId: string,
    accountData: CreateBankAccountDto,
  ): Promise<BankAccount> {
    const existingAccount = await this.ormBankAccountsRepository.findOne({
      where: { userId },
    });

    if (existingAccount) {
      const updatedAccount = this.ormBankAccountsRepository.merge(
        existingAccount,
        accountData,
      );
      return await this.ormBankAccountsRepository.save(updatedAccount);
    }

    const newAccount = this.ormBankAccountsRepository.create({
      ...accountData,
      userId,
    });
    return await this.ormBankAccountsRepository.save(newAccount);
  }

  async deactivateAccount(id: string): Promise<boolean> {
    const result = await this.ormBankAccountsRepository.softDelete({ id });
    return (result.affected ?? 0) > 0;
  }
}
