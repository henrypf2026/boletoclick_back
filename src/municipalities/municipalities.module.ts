import { Module } from '@nestjs/common';
import { MunicipalitiesService } from './municipalities.service';
import { MunicipalitiesController } from './municipalities.controller';
import { Municipality } from './entities/municipality.entity';
import { MunicipalitiesRepository } from './municipalities.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvinceService } from '../province/province.service';
import { Province } from '../province/entities/province.entity';
import { ProvinceRepository } from '../province/province.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Municipality, Province])],
  controllers: [MunicipalitiesController],
  providers: [
    MunicipalitiesService,
    MunicipalitiesRepository,
    ProvinceService,
    ProvinceRepository,
  ],
  exports: [MunicipalitiesService],
})
export class MunicipalitiesModule {}
