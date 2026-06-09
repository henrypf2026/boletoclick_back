import { Controller, Get, Param } from '@nestjs/common';
import { MunicipalitiesService } from './municipalities.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('municipalities')
export class MunicipalitiesController {
  constructor(private readonly municipalitiesService: MunicipalitiesService) {}

  // @Post()
  // create(@Body() createMunicipalityDto: CreateMunicipalityDto) {
  //   return this.municipalitiesService.create(createMunicipalityDto);
  // }

  // @Get()
  // async findAll() {
  //   return await this.municipalitiesService.findAll();
  // }

  // @Get()
  // async findAllWithEvents() {
  //   return await this.municipalitiesService.findAllWithEvents();
  // }

  @Get(':id')
  @ApiOperation({
    summary: 'Municipio con sus eventos',
  })
  findOne(@Param('id') id: string) {
    return this.municipalitiesService.findOne(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateMunicipalityDto: UpdateMunicipalityDto,
  // ) {
  //   return this.municipalitiesService.update(+id, updateMunicipalityDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.municipalitiesService.remove(+id);
  // }
}
