import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';

@Module({
  imports: [SupabaseModule, TypeOrmModule.forFeature([Profile])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
