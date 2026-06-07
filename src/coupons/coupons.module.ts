import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { Coupon } from './entities/coupon.entity';
import { CouponsRepository } from './coupons.repository';
import { SupabaseModule } from '../supabase/supabase.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon]), SupabaseModule, UsersModule],
  controllers: [CouponsController],
  providers: [CouponsService, CouponsRepository],
  exports: [CouponsService],
})
export class CouponsModule {}
