import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Category } from '../categories/entities/category.entity';
import { Venue } from '../venues/entities/venue.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity'; // 👈 Importamos User
import { MunicipalitiesService } from '../municipalities/municipalities.service';
import { Municipality } from '../municipalities/entities/municipality.entity';
import { MunicipalitiesRepository } from '../municipalities/municipalities.repository';
import { ProvinceService } from '../province/province.service';
import { ProvinceRepository } from '../province/province.repository';
import { Province } from '../province/entities/province.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Venue,
      Event,
      User,
      Municipality,
      Province,
    ]), // 👈 Agregamos User aquí
  ],
  providers: [
    SeedService,
    MunicipalitiesService,
    MunicipalitiesRepository,
    ProvinceService,
    ProvinceRepository,
  ],
  exports: [SeedService],
})
export class SeedModule {}
