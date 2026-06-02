import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipality } from './entities/municipality.entity';
import { all_municipalities_colombia } from '../common/data/all_provinces_and_municipalities_colombia';
import { ProvinceService } from '../province/province.service';

@Injectable()
export class MunicipalitiesRepository {
  constructor(
    @InjectRepository(Municipality)
    private readonly ormMunicipalitiesRepository: Repository<Municipality>,
    private readonly provinceService: ProvinceService,
  ) {}

  async addSedder() {
    const promises_municipalities = all_municipalities_colombia.map(
      async (info) => {
        const Code_province_number = Number(info.Code_province);
        const provincia =
          await this.provinceService.findByProvinceCode(Code_province_number);

        if (!provincia) throw new BadRequestException('fallo en los bd');
        const date = new Date().toString();
        const municipality = new Municipality();
        municipality.name = info.Municipality;
        municipality.municipalityCode = Number(info.Code_municipality);
        municipality.createdAt = date;
        municipality.province = provincia;

        return this.ormMunicipalitiesRepository.save(municipality);
      },
    );

    await Promise.all(promises_municipalities);
  }
}
