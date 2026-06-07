import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { BankAccount } from './entities/bank-account.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Bank Accounts')
@ApiBearerAuth()
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Put()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
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
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
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
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all bank accounts (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'A list of all registered bank accounts.',
    type: [BankAccount],
  })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  async getAllBankAccounts(): Promise<BankAccount[]> {
    return await this.bankAccountsService.getAllBankAccounts();
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get a specific bank account by its ID (Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the bank account',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'The bank account details.',
    type: BankAccount,
  })
  @ApiResponse({ status: 404, description: 'Bank account not found.' })
  async getBankAccountById(@Param('id') id: string): Promise<BankAccount> {
    return await this.bankAccountsService.getBankAccountById(id);
  }

  @Delete()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
  @ApiOperation({
    summary: 'Deactivate the authenticated user bank account (User dashboard)',
  })
  @ApiResponse({
    status: 200,
    description: 'Your bank account has been successfully deactivated.',
  })
  async deactivateOwnAccount(@Req() req: any) {
    const userId = req.user?.id;
    await this.bankAccountsService.deactivateOwnAccount(userId);
    return {
      success: true,
      message: 'Your bank account was successfully deactivated',
    };
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Deactivate ANY bank account by its ID (Admin panel only)',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the bank account to deactivate',
  })
  @ApiResponse({
    status: 200,
    description: 'Bank account successfully deactivated by admin.',
  })
  async deactivateAccountAsAdmin(@Param('id') id: string) {
    await this.bankAccountsService.deactivateAccountAsAdmin(id);

    return {
      success: true,
      message: `Bank account with ID ${id} was successfully deactivated by admin`,
    };
  }
}
