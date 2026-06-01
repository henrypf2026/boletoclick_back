import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Venue } from './entities/venue.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Venues')
@ApiBearerAuth()
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
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
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
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
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
