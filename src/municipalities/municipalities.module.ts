import { Module } from '@nestjs/common';
import { MunicipalitiesController } from './municipalities.controller';
import { MunicipalitiesService } from './municipalities.service';

@Module({
  controllers: [MunicipalitiesController],
  providers: [MunicipalitiesService]
})
export class MunicipalitiesModule {}
