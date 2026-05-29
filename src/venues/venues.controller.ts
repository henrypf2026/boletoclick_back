import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Venue } from './entities/venue.entity';
import { ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @ApiResponse({
    status: 201,
    type: Venue,
    description: 'Respuesta exitosa',
  })
  @ApiBody({
    type: CreateVenueDto,
  })
  create(@Body() createVenueDto: CreateVenueDto) {
    return this.venuesService.create(createVenueDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    content: {
      'aplication/json': {
        example: [
          {
            id: '6d258a20-3711-4391-aa36-2c49f1063670',
            firstName: 'Test Juan',
            email: 'Test@test.com',
            phone: '31246586286',
            country: 'Bolivia',
            address: 'calle 4 sur # 71d 85',
            city: 'cochabamba',
          },
          {
            id: '6967ada8-363c-46c3-826e-b1f610cfbe3e',
            firstName: 'Andres',
            email: 'Andres@bbc.com',
            phone: '3154589432',
            country: 'Colombia',
            address: 'Avenida 0 #14 -5 ',
            city: 'Villavicencio',
          },
          {
            id: '9f85c9bb-c8da-4379-b9ec-509113c119df',
            firstName: 'Bernardo Vivas',
            email: 'Bernardo@google.com',
            phone: '31215',
            country: 'Colombia',
            address: 'Avenida 0 #14 -5 ',
            city: 'Villavicencio',
          },
          {
            id: '0c8c36ee-a75d-4ce6-ae3f-f6a21ed89f8c',
            firstName: 'Test Juan',
            email: 'Test500@test.com',
            phone: '31246586286',
            country: 'Bolivia',
            address: 'calle 4 sur # 71d 85',
            city: 'cochabamba',
          },
          {
            id: '95223d0f-1243-4cae-80db-593aaeac0db0',
            firstName: 'Bernardo Vivas',
            email: 'ccc@bbb.com',
            phone: '31215',
            country: 'Colombia',
            address: 'Avenida 0 #14 -5 ',
            city: 'Villavicencio',
          },
        ],
      },
    },

    description: 'Respuesta exitosa',
  })
  // @ApiQuery({
  //   name: 'page',
  //   description: 'El valor por defecto es 1',
  //   required: false,
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   description: 'El valor por defecto es 5',
  //   required: false,
  // })
  findAll() {
    return this.venuesService.findAll();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    type: Venue,
    description: 'Respuesta exitosa',
  })
  @ApiQuery({
    name: 'id',
    description: 'Es un UUID version 4',
    required: false,
  })
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @Patch(':id')
    @ApiResponse({
    status: 201,
    example: 'Producto modificado',
    description: 'Respuesta exitosa',
  })
  @ApiBody({
    type: CreateVenueDto,
    examples: {
      'ejemplo 1': {
        value: {
          firstName: 'Test Name carbono',
          email: 'Test@test.com',
          password: 'ClaveTest#',
          address: 'calle 4 sur # 71d 85',
          phone: 31246586286,
          country: 'Colombia',
          city: 'Cali',
        },
      },
      'ejemplo 2': {
        value: {
          firstName: 'Test Name carbono',
          email: 'Test@test.com',
          password: 'ClaveTest#',
        },
      },
    },
    description: 'Se puede omitir propiedades',
  })
  @ApiParam({
    name: 'id',
    description: 'Es un UUID version 4',
    required: true,
  })
  update(@Param('id') id: string, @Body() updateVenueDto: UpdateVenueDto) {
    return this.venuesService.update(id, updateVenueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
