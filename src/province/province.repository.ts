import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { all_provinces_mexico } from '../common/data/all_provinces_mexico';

@Injectable()
export class ProvinceRepository {
  constructor(
    @InjectRepository(Province)
    private readonly ormProvinceRepository: Repository<Province>,
  ) {}

  // async create(createProvinceDto: CreateProvinceDto) {
  //   const exits = await this.ormProvinceRepository.findOneBy({
  //     provinceCode: createProvinceDto.provinceCode,
  //   });

  //   if (exits) throw new BadRequestException('Provincia ya existe');
  //   const date = new Date().toString();
  //   const province = new Province();
  //   province.name = createProvinceDto.name;
  //   province.provinceCode = createProvinceDto.provinceCode;
  //   province.createdAt = date;

  //   const provinceSaved = await this.ormProvinceRepository.save(province);
  //   return {
  //     message: 'Provincia almacenada en la base datos',
  //     provinceSaved,
  //   };
  // }

  async findAll() {
    const allProvinces = await this.ormProvinceRepository.find();

    if (!allProvinces) throw new BadRequestException('Provincia no encontrada');

    const allProvincesFormatted = allProvinces.map((province) => {
      const { deletedAt, createdAt, updatedAt, ...formattedProvince } =
        province;
      return formattedProvince;
    });

    return {
      message: 'Todas las provicias de Mexico',
      allProvincesFormatted,
    };
  }

  async findAllWithEvents() {
    const allProvinces = await this.ormProvinceRepository
      .createQueryBuilder('provnces') // 'user' es el alias para la tabla de usuarios
      // 1. Une Provincia con sus Municipalidades
      .innerJoinAndSelect('province.municipalities', 'municipality')

      // 2. Une Municipalidad con sus Recintos (Venues)
      .innerJoinAndSelect('municipality.venues', 'venue')

      // 3. Une Recinto con sus Eventos
      .innerJoinAndSelect('venue.events', 'event')

      // Filtro opcional: solo si el evento está activo (si aplica en tu lógica)
      // .where('event.isActive = :status', { status: true })
      .orderBy('user.createdAt', 'DESC')
      .getMany(); // Ejecuta y retorna un arreglo de usuarios

    if (!allProvinces.length)
      throw new BadRequestException('Provincia no encontrada');

    const allProvincesFormatted = allProvinces.map((province) => {
      const { deletedAt, createdAt, updatedAt, ...formattedProvince } =
        province;
      return formattedProvince;
    });

    return {
      message: 'Todas las provicias de Mexico',
      allProvincesFormatted,
    };
  }

  // async findOne(id: string) {
  //   const province = await this.ormProvinceRepository
  //     .createQueryBuilder('province')
  //     // 1. Unimos las relaciones (Inner Join para filtrar, Left Join si quieres conservar la relación limpia)
  //     .innerJoinAndSelect('province.municipality', 'municipality')
  //     .innerJoinAndSelect('municipality.venues', 'venues')
  //     .innerJoin('venues.events', 'events') // Inner join aquí asegura que solo entren venues con eventos

  //     // 2. Seleccionamos exactamente los campos que necesitas
  //     .select([
  //       'province.id',
  //       'province.name',
  //       'province.abbreviation',
  //       'municipality.id',
  //       'municipality.name',
  //       'venues.id',
  //       'venues.name',
  //       'venues.address',
  //       'venues.capacity',
  //       'venues.imgUrl',
  //       'venues.latitude',
  //       'venues.longitude',
  //       'event.title',
  //     ])

  //     // 3. Filtramos por el ID de la provincia
  //     .where('province.id = :id', { id })
  //     .getOne();

  //   return province;
  // }

  async findOne(id: string) {
    const province = await this.ormProvinceRepository.findOne({
      where: { id: id },
      relations: { municipality: { venues: { events: true } } },
      select: {
        id: true,
        name: true,
        abbreviation: true,
        municipality: {
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
            events: {
              id: true,
              title: true,
              description: true,
              eventDate: true,
              posterUrl: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    });

    if (!province) throw new BadRequestException('Provincia no encontrada');
    return {
      message: 'Provincia encontrada',
      province,
    };
  }

  async addSedder() {
    const promises_insert = all_provinces_mexico.map(async (info) => {
      const date = new Date().toString();
      const newProvince = new Province();
      newProvince.name = info.Entidad_federativa;
      newProvince.provinceCode = info.Province_key;
      newProvince.abbreviation = info.Abreviatura;
      newProvince.createdAt = date;
      return this.ormProvinceRepository.save(newProvince);
    });

    await Promise.all(promises_insert);

    return 'Provincias agregadas';
  }

  async findByProvinceCode(code: string) {
    return await this.ormProvinceRepository.findOneBy({
      provinceCode: code,
    });
  }

  // async update(id: string, updateProvinceDto: UpdateProvinceDto) {
  //   const exists = await this.ormProvinceRepository.findOne({
  //     where: { id: id },
  //   });

  //   if (!exists) {
  //     throw new BadRequestException(
  //       'La provincia no se encuentra en la base de datos',
  //     );
  //   }
  //   const date = new Date().toString();
  //   updateProvinceDto.updatedAt = date;
  //   const updateResponse = await this.ormProvinceRepository.update(
  //     id,
  //     updateProvinceDto,
  //   );

  //   if (!updateResponse.affected)
  //     throw new BadRequestException('Provincia no modificada');

  //   const provinceModificated = await this.ormProvinceRepository.findOne({
  //     where: { id: id },
  //   });
  //   return {
  //     menssage: 'Provincia modficada',
  //     provinceModificated,
  //   };
  // }

  // async remove(id: string) {
  //   const dateOfDelete = new Date().toString();
  //   const provincia = new Province();
  //   provincia.deletedAt = dateOfDelete;

  //   const updateResponse = await this.ormProvinceRepository.update(
  //     id,
  //     provincia,
  //   );
  //   if (!updateResponse.affected)
  //     throw new BadRequestException('Provincia no modificada');
  //   const provinceDeleted = await this.ormProvinceRepository.findOne({
  //     where: { id: id },
  //   });
  //   return {
  //     menssage: 'Provincia modficada',
  //     provinceDeleted,
  //   };
  // }
}
