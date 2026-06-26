import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { ILike, Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EventStatus } from '../common/enums/event-status.enum';
import { Municipality } from '../municipalities/entities/municipality.entity';

@Injectable()
export class VenuesRepository {
  constructor(
    @InjectRepository(Venue)
    private readonly ormVenueRepository: Repository<Venue>,
  ) { }

  async findAllVenues(): Promise<Venue[]> {
    return await this.ormVenueRepository
      .createQueryBuilder('venue')
      .leftJoinAndSelect('venue.municipality', 'municipality')
      .leftJoinAndSelect(
        'venue.events',
        'event',
        'event.status = :status AND event.eventDate > :now',
        {
          status: EventStatus.APPROVED,
          now: new Date().toISOString(),
        },
      )
      .orderBy('event.eventDate', 'ASC')
      .getMany();
  }

  async findVenueById(id: string): Promise<Venue> {
    const venue = await this.ormVenueRepository.findOne({
      where: { id },
      relations: {
        municipality: true,
      },
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    return venue;
  }

  async createVenue(createVenueDto: CreateVenueDto): Promise<Venue> {
    const { municipalityId, ...venueData } = createVenueDto;

    const municipality = await this.ormVenueRepository.manager.findOne(
      Municipality,
      {
        where: { id: municipalityId },
      },
    );

    if (!municipality) {
      throw new NotFoundException(
        `El municipio/ciudad con ID ${municipalityId} no existe.`,
      );
    }

    const existingVenue = await this.ormVenueRepository.findOne({
      where: {
        name: ILike(createVenueDto.name.trim()),
        municipality: { id: municipalityId },
      },
    });

    if (existingVenue) {
      throw new BadRequestException(
        `A venue with the name '${createVenueDto.name}' already exists in this municipality.`,
      );
    }

    const venue = this.ormVenueRepository.create({
      ...venueData,
      municipality,
    });

    const savedVenue = await this.ormVenueRepository.save(venue);

    return (await this.ormVenueRepository.findOne({
      where: { id: savedVenue.id },
      relations: {
        municipality: true,
      },
    }))!;
  }

  async updateVenue(
    id: string,
    updateVenueDto: UpdateVenueDto,
  ): Promise<Venue> {
    const venue = await this.ormVenueRepository.findOne({
      where: { id },
      relations: {
        municipality: true,
      },
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    const { municipalityId, ...venueData } = updateVenueDto;

    Object.assign(venue, venueData);

    if (municipalityId) {
      const municipality = await this.ormVenueRepository.manager.findOne(
        Municipality,
        {
          where: { id: municipalityId },
        },
      );
      if (!municipality) {
        throw new NotFoundException(
          `El municipio/ciudad con ID ${municipalityId} no existe.`,
        );
      }
      venue.municipality = municipality;
    }

    await this.ormVenueRepository.save(venue);

    return (await this.ormVenueRepository.findOne({
      where: { id },
      relations: {
        municipality: true,
      },
    }))!;
  }

  async removeVenue(id: string) {
    const result = await this.ormVenueRepository.softDelete({ id });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException('Venue not found or already deleted');
    }
  }
}
