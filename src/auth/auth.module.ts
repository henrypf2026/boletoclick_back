import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [SupabaseModule, UsersModule, EmailModule, CommonModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthGuard, RolesGuard],
})
export class AuthModule {}
