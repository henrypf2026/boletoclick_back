import { Module } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { VenuesRepository } from './venues.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entities/venue.entity';
import { SupabaseModule } from '../supabase/supabase.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Venue]), SupabaseModule, UsersModule],
  controllers: [VenuesController],
  providers: [VenuesService, VenuesRepository],
})
export class VenuesModule {}
