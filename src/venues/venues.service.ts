import { Injectable } from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenuesRepository } from './venues.repository';

@Injectable()
export class VenuesService {
  constructor(private readonly venueRepository: VenuesRepository) {}

  createVenue(createVenueDto: CreateVenueDto) {
    return this.venueRepository.createVenue(createVenueDto);
  }

  async findAllVenues() {
    return await this.venueRepository.findAllVenues();
  }

  findVenueById(id: string) {
    return this.venueRepository.findVenueById(id);
  }

  updateVenue(id: string, updateVenueDto: UpdateVenueDto) {
    return this.venueRepository.updateVenue(id, updateVenueDto);
  }

  removeVenue(id: string) {
    return this.venueRepository.removeVenue(id);
  }
}
