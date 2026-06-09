import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipality } from './entities/municipality.entity';
// import { all_municipalities_colombia } from '../common/data/all_provinces_and_municipalities_colombia';
import { ProvinceService } from '../province/province.service';
import { all_muncipalities_mexico } from '../common/data/all_municipalaties_mexico';

@Injectable()
export class MunicipalitiesRepository {
  constructor(
    @InjectRepository(Municipality)
    private readonly ormMunicipalitiesRepository: Repository<Municipality>,
    private readonly provinceService: ProvinceService,
  ) {}

  // async findAll() {
  //   const allMunicipalities = await this.ormMunicipalitiesRepository.find();
  //   return {
  //     message: 'Todas los muncipios de mexico',
  //     allMunicipalities,
  //   };
  // }
  async findOne(id: string) {
    const municipalityById = await this.ormMunicipalitiesRepository
      .createQueryBuilder('municipality')
      .innerJoinAndSelect('municipality.venues', 'venue')
      .addOrderBy('venue.name', 'ASC')
      .innerJoinAndSelect('venue.events', 'event')
      .addOrderBy('event.title', 'ASC')
      .select([
        'municipality.id', // Obligatorio el ID
        'municipality.name', // Ejemplo: nombre del municipio

        'venue.id', // Obligatorio el ID
        'venue.name', // Ejemplo: nombre del lugar/recinto
        // 'venue.address', // Ejemplo: nombre del lugar/recinto
        // 'venue.capacity', // Ejemplo: nombre del lugar/recinto
        // 'venue.imgUrl', // Ejemplo: nombre del lugar/recinto
        // 'venue.latitude', // Ejemplo: nombre del lugar/recinto
        // 'venue.longitude', // Ejemplo: nombre del lugar/recinto

        'event.id', // Obligatorio el ID
        'event.title', // Ejemplo: título del evento
        'event.description', // Ejemplo: título del evento
        'event.eventDate', // Ejemplo: título del evento
        'event.posterUrl', // Ejemplo: título del evento
        'event.createdAt', // Ejemplo: título del evento
        'event.updatedAt', // Ejemplo: título del evento
      ])
      .getOne();

    if (!municipalityById)
      throw new BadRequestException('Municipio no encontrada');

    // const allProvincesFormatted = allProvinces.map((province) => {
    //   const { deletedAt, createdAt, updatedAt, ...formattedProvince } =
    //     province;
    //   return formattedProvince;
    // });

    return {
      message: 'Municipio con sus eventos',
      municipalityById,
    };

    const allMunicipalities = await this.ormMunicipalitiesRepository.findOne({
      where: { id: id },
      relations: { venues: { events: true } },
      select: {
        id: true,
        name: true,
        venues: {
          id: true,
          name: true,
          address: true,
          capacity: true,
          imgUrl: true,
          latitude: true,
          longitude: true,
        },
      },
    });

    if (!allMunicipalities)
      throw new BadRequestException('Municipio no encontrado');

    return {
      message: 'Municipio con id ',
      allMunicipalities,
    };
  }

  async addSedder() {
    try {
      const promises_municipalities = all_muncipalities_mexico.map(
        async (info) => {
          const provincia = await this.provinceService.findByProvinceCode(
            info.Province_key,
          );

          if (!provincia)
            throw new BadRequestException('Provincia no encontrada');
          const date = new Date().toString();
          const municipality = new Municipality();
          municipality.name = info.Municipio;
          municipality.municipalityUniqueCode = info.Codigounico;
          municipality.createdAt = date;
          municipality.province = provincia;

          return this.ormMunicipalitiesRepository.save(municipality);
        },
      );

      await Promise.all(promises_municipalities);
    } catch (error) {
      console.error('❌ [Seeder] Error crítico durante la siembra:', error);
    }
  }

  async findByMunicpalityCode(municipalityCode: string) {
    return await this.ormMunicipalitiesRepository.findOne({
      where: { municipalityUniqueCode: municipalityCode },
      relations: { province: true },
    });
  }
}
