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
  async findAll() {
    return await this.venuesService.findAll();
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
