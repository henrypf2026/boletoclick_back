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
    //falta tener el servicio de users para primero validar que el usuario exista
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

  async deactivateOwnAccount(userId: string): Promise<void> {
    const result = await this.ormBankAccountsRepository.softDelete({ userId });
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException('No active bank account found for this user');
    }
  }

  async deactivateAccountAsAdmin(id: string): Promise<void> {
    const result = await this.ormBankAccountsRepository.softDelete({ id });
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException('No active bank account found for this user');
    }
  }
}
