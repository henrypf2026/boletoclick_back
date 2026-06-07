import { Module } from '@nestjs/common';
import { MapsService } from './maps.service';

@Module({
  providers: [MapsService]
})
export class MapsModule {}
