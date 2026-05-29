import { Module } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { VenuesRepository } from './venues.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entities/venue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venue])],
  controllers: [VenuesController],
  providers: [VenuesService, VenuesRepository],
})
export class VenuesModule {}
