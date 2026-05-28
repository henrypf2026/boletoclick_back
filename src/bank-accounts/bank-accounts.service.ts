import { Injectable } from '@nestjs/common';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { BankAccountsRepository } from './bank-accounts.repository';
import { BankAccount } from './entities/bank-account.entity';

@Injectable()
export class BankAccountsService {
  constructor(
    private readonly bankAccountsRepository: BankAccountsRepository,
  ) {}

  async getAllBankAccounts() {
    return await this.bankAccountsRepository.getAllBankAccounts();
  }

  async getBankAccountById(id: string) {
    return await this.bankAccountsRepository.getBankAccountById(id);
  }

  async getBankAccountByUserId(userId: string): Promise<BankAccount> {
    return await this.bankAccountsRepository.getBankAccountByUserId(userId);
  }

  async upsertBankAccount(
    userId: string,
    accountData: CreateBankAccountDto,
  ): Promise<BankAccount> {
    return await this.bankAccountsRepository.upsertBankAccount(
      userId,
      accountData,
    );
  }

  async deactivateBankAccount(id: string) {
    return await this.bankAccountsRepository.deactivateAccount(id);
  }
}
