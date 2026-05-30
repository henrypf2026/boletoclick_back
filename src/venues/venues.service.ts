import { Injectable } from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenuesRepository } from './venues.repository';

@Injectable()
export class VenuesService {
  constructor(private readonly venueRepository: VenuesRepository) {}

  create(createVenueDto: CreateVenueDto) {
    return this.venueRepository.create(createVenueDto);
  }

  async findAll() {
    return await this.venueRepository.findAll();
  }

  findOne(id: string) {
    return this.venueRepository.findOne(id);
  }

  update(id: string, updateVenueDto: UpdateVenueDto) {
    return this.venueRepository.update(id, updateVenueDto);
  }

  remove(id: string) {
    return this.venueRepository.remove(id);
  }
}
