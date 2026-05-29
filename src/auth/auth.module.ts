import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [SupabaseModule, TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthGuard, RolesGuard],
})
export class AuthModule {}
