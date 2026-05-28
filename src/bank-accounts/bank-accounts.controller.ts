import { Controller, Get, Body, Param, Delete, Put, Req } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { BankAccount } from './entities/bank-account.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Put()
  // @UseGuards(JwtAuthGuard) // Descoméntalo cuando tengan listo el guard de autenticación
  @ApiOperation({
    summary: 'Create or update the bank account for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'The bank account has been successfully created or updated.',
    type: BankAccount,
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation failed.' })
  async upsert(
    @Req() req: any,
    @Body() accountData: CreateBankAccountDto,
  ): Promise<BankAccount> {
    const userId = req.user?.id;

    return await this.bankAccountsService.upsertBankAccount(
      userId,
      accountData,
    );
  }

  @Get('me')
  // @UseGuards(JwtAuthGuard) // Recuerda activarlo cuando el Guard esté listo
  @ApiOperation({ summary: 'Get the bank account of the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'The bank account details.',
    type: BankAccount,
  })
  @ApiResponse({
    status: 404,
    description: 'Bank account not found for this user.',
  })
  async getBankAccountByUserId(@Req() req: any): Promise<BankAccount> {
    const userId = req.user?.id;

    return await this.bankAccountsService.getBankAccountByUserId(userId);
  }
  @Get()
  //proteger esta ruta solo para admins
  getAllBankAccounts() {
    return this.bankAccountsService.getAllBankAccounts();
  }

  @Get(':id')
  //proteger esta ruta solo para admins
  getBankAccountById(@Param('id') id: string) {
    return this.bankAccountsService.getBankAccountById(id);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard) // Descoméntalo cuando tengan listo el guard de autenticación
  deactivateBankAccount(@Param('id') id: string) {
    return this.bankAccountsService.deactivateBankAccount(id);
  }
}
