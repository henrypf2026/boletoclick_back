import { Controller } from '@nestjs/common';
import { MunicipalitiesService } from './municipalities.service';

@Controller('municipalities')
export class MunicipalitiesController {
  constructor(private readonly municipalitiesService: MunicipalitiesService) {}

  // @Post()
  // create(@Body() createMunicipalityDto: CreateMunicipalityDto) {
  //   return this.municipalitiesService.create(createMunicipalityDto);
  // }

  // @Get()
  // findAll() {
  //   return this.municipalitiesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.municipalitiesService.findOne(+id);
  // }

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
