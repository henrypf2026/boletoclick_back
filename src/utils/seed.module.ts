import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Category } from '../categories/entities/category.entity';
import { Venue } from '../venues/entities/venue.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity'; // 👈 Importamos User

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Venue, Event, User]), // 👈 Agregamos User aquí
  ],
  providers: [SeedService],
})
export class SeedModule {}
