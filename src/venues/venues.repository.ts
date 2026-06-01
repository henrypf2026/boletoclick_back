import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VenuesRepository {
  constructor(
    @InjectRepository(Venue)
    private readonly ormVenueRepository: Repository<Venue>,
  ) {}
  async create(createVenueDto: CreateVenueDto) {
    const venue = new Venue();
    venue.address = createVenueDto.address;
    venue.capacity = createVenueDto.capacity;
    venue.city = createVenueDto.city;
    venue.imgUrl = createVenueDto.imgUrl;
    venue.latitude = createVenueDto.latitude;
    venue.longitude = createVenueDto.longitude;
    venue.name = createVenueDto.name;

    return await this.ormVenueRepository.save(venue);
  }

  async findAll() {
    return await this.ormVenueRepository.find();
  }

  async findOne(id: string) {
    return await this.ormVenueRepository.findOne({ where: { id: id } });
  }

  async update(id: string, updateVenueDto: UpdateVenueDto) {
    const modificacionClaveValor = Object.entries(updateVenueDto);

    const modificacionFiltrada = Object.fromEntries(
      modificacionClaveValor.filter(([nombre, valor]) => valor != undefined),
    );

    const resultadoModificacion = await this.ormVenueRepository
      .createQueryBuilder()
      .update(Venue)
      .set(modificacionFiltrada)
      .where('id = :id', { id: id })
      .execute();

    const numeroDeUsuarioModificados = resultadoModificacion.affected;
    if (!numeroDeUsuarioModificados)
      throw new BadRequestException(`Any venues with id ${id}`);

    return `Modificated venue with #${id} venue`;
  }

  async remove(id: string) {
    const result = await this.ormVenueRepository.softDelete({ id });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException('Venue not found or already deleted');
    }
  }
}
