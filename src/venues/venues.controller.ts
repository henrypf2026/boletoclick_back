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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Venues')
@ApiBearerAuth()
@SkipThrottle() // 👈 acá va, a nivel de clase
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
  @ApiResponse({
    status: 201,
    type: Venue,
    description: 'Venue creado exitosamente',
  })
  @ApiBody({
    type: CreateVenueDto,
  })
  createVenue(@Body() createVenueDto: CreateVenueDto): Promise<Venue> {
    return this.venuesService.createVenue(createVenueDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: [Venue],
    description: 'Lista de todos los venues con su municipio',
  })
  findAllVenues(): Promise<Venue[]> {
    return this.venuesService.findAllVenues();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    type: Venue,
    description: 'Detalle del venue encontrado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del venue (UUID v4)',
    required: true,
  })
  findVenueById(@Param('id') id: string): Promise<Venue> {
    return this.venuesService.findVenueById(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
  @ApiResponse({
    status: 200,
    type: Venue,
    description: 'Venue modificado exitosamente',
  })
  @ApiBody({
    type: UpdateVenueDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del venue (UUID v4)',
    required: true,
  })
  updateVenue(
    @Param('id') id: string,
    @Body() updateVenueDto: UpdateVenueDto,
  ): Promise<Venue> {
    return this.venuesService.updateVenue(id, updateVenueDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
  @ApiResponse({
    status: 200,
    description: 'Venue eliminado lógicamente (soft-delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del venue (UUID v4)',
    required: true,
  })
  removeVenue(@Param('id') id: string): Promise<void> {
    return this.venuesService.removeVenue(id);
  }
}