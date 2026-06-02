import { Injectable } from '@nestjs/common';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { ProvinceRepository } from './province.repository';

@Injectable()
export class ProvinceService {
  constructor(private readonly provinceRepository: ProvinceRepository) {}

  async create(createProvinceDto: CreateProvinceDto) {
    return await this.provinceRepository.create(createProvinceDto);
  }

  async addSedder() {
    return await this.provinceRepository.addSedder();
  }
  async findAll() {
    return await this.provinceRepository.findAll();
  }

  async findOne(id: string) {
    return await this.provinceRepository.findOne(id);
  }

  async findByProvinceCode(code: number) {
    return await this.provinceRepository.findByProvinceCode(code);
  }

  async update(id: string, updateProvinceDto: UpdateProvinceDto) {
    return await this.provinceRepository.update(id, updateProvinceDto);
  }

  async remove(id: string) {
    return await this.provinceRepository.remove(id);
  }
}
