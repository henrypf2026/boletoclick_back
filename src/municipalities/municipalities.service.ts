import { Injectable } from '@nestjs/common';
import { MunicipalitiesRepository } from './municipalities.repository';

@Injectable()
export class MunicipalitiesService {
  constructor(
    private readonly municipalitesRepository: MunicipalitiesRepository,
  ) {}

  // create(createMunicipalityDto: CreateMunicipalityDto) {
  //   return 'This action adds a new municipality';
  // }

  async addSedder() {
    return await this.municipalitesRepository.addSedder();
  }

  // findAll() {
  //   return `This action returns all municipalities`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} municipality`;
  // }

  // update(id: number, updateMunicipalityDto: UpdateMunicipalityDto) {
  //   return `This action updates a #${id} municipality`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} municipality`;
  // }
}
