import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProvinceService } from './province.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { Province } from './entities/province.entity';
import { ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Post()
  @ApiResponse({
    status: 201,
    type: Province,
    description: 'Respuesta exitosa',
    schema: {
      example: {
        message: 'Provincia almacenada en la base datos',
        provinceSaved: {
          id: '321203bd-191b-44c4-ac8b-ab6723676c8f',
          name: 'ANTIOQUIA',
          provinceCode: 7,
          deletedAt: null,
          createdAt:
            'Mon Jun 01 2026 00:16:36 GMT-0500 (hora estándar de Colombia)',
          updatedAt: null,
        },
      },
    },
  })
  @ApiBody({
    type: CreateProvinceDto,
  })
  async create(@Body() createProvinceDto: CreateProvinceDto) {
    return await this.provinceService.create(createProvinceDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: [Province],
    description: 'Respuesta exitosa',
    schema: {
      example: {
        message: 'Todas las provicias de Colombia',
        allProvinces: [
          {
            id: '87909d57-273a-40ef-97e4-98108a93cf45',
            name: 'Antioquia',
            provinceCode: 5,
            deletedAt: null,
            createdAt: '2026-06-01T04:40:18.000Z',
            updatedAt: null,
          },
          {
            id: '524fd862-327f-4d81-9010-ce93abbc0fb1',
            name: 'Atlántico',
            provinceCode: 8,
            deletedAt: null,
            createdAt: '2026-06-01T04:40:18.000Z',
            updatedAt: null,
          },
        ],
      },
    },
  })
  findAll() {
    return this.provinceService.findAll();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    type: [Province],
    description: 'Respuesta exitosa',
    schema: {
      example: {
        message: 'Provincia encontrada',
        provinceSearched: {
          id: 'd6b232ce-919d-4ec9-b994-c5f2e3a3e245',
          name: 'Antioquia',
          provinceCode: 5,
          deletedAt: null,
          createdAt: '2026-06-01T05:16:20.000Z',
          updatedAt: null,
          municipality: ['Trae todos los municipios de la provincia'],
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del usuario UUID',
    example: 'd6b232ce-919d-4ec9-b994-c5f2e3a3e245',
    type: String,
  })
  findOne(@Param('id') id: string) {
    return this.provinceService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    type: [Province],
    description: 'Respuesta exitosa',
    schema: {
      example: {
        menssage: 'Provincia modficada',
        provinceModificated: {
          id: 'd6b232ce-919d-4ec9-b994-c5f2e3a3e245',
          name: 'ANTIOQUIAsss',
          provinceCode: 5,
          deletedAt: null,
          createdAt: '2026-06-01T05:16:20.000Z',
          updatedAt: null,
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del usuario UUID',
    example: 'd6b232ce-919d-4ec9-b994-c5f2e3a3e245',
    type: String,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProvinceDto: UpdateProvinceDto,
  ) {
    return await this.provinceService.update(id, updateProvinceDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    type: [Province],
    description: 'Respuesta exitosa',
    schema: {
      example: {
        menssage: 'Provincia modficada',
        id: 'd6b232ce-919d-4ec9-b994-c5f2e3a3e245',
        name: 'ANTIOQUIAsss',
        provinceCode: 5,
        deletedAt: '2026-06-01T05:19:04.000Z',
        createdAt: '2026-06-01T05:16:20.000Z',
        updatedAt: null,
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del usuario UUID',
    example: 'd6b232ce-919d-4ec9-b994-c5f2e3a3e245',
    type: String,
  })
  remove(@Param('id') id: string) {
    return this.provinceService.remove(id);
  }
}
