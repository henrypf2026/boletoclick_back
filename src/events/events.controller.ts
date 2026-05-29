import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiConsumes('multipart/form-data') // 💡 Le dice a Swagger que este endpoint recibe un archivo binario
  @ApiOperation({
    summary: 'Create a new event with its ticket types',
  })
  @ApiResponse({
    status: 201,
    description: 'Event and ticket types successfully created.',
    type: Event,
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('producer')
  @UseInterceptors(FileInterceptor('poster')) // 📸 Atrapa el archivo binario del campo 'poster'
  async createEvent(
    @Req() req: any,
    @Body() eventData: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Event> {
    // EXTRAER EL PRODUCTOR: En producción vendrá del JwtAuthGuard.
    // Dejamos un fallback ID quemado por si estás probando en Postman sin token aún.
    const producerId = req.user?.id || 'd3b07384-d113-4ec5-a587-343d92001234';

    // FLUJO DE CLOUDINARY: Aquí llamarías a tu servicio de subida de archivos.
    // const posterUrl = await this.cloudinaryService.uploadImage(file);
    const mockPosterUrl =
      'https://res.cloudinary.com/boletoclick/image/upload/v12345/default-poster.jpg';
    const posterUrl = file
      ? `https://res.cloudinary.com/mock-path/${file.originalname}`
      : mockPosterUrl;

    // Ejecutamos la transacción atómica pasando las 3 piezas limpias
    return await this.eventsService.createEvent(
      producerId,
      eventData,
      posterUrl,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all active events' })
  @ApiResponse({
    status: 200,
    description: 'List of events retrieved successfully.',
    type: [Event],
  })
  async getAllEvents(): Promise<Event[]> {
    return await this.eventsService.getAllEvents();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific event by its ID along with its ticket types',
  })
  @ApiParam({ name: 'id', description: 'The UUID of the event' })
  @ApiResponse({ status: 200, description: 'Event found.', type: Event })
  async getEventById(@Param('id', ParseUUIDPipe) id: string): Promise<Event> {
    return await this.eventsService.getEventById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate an event (Soft Delete)' })
  @ApiParam({ name: 'id', description: 'The UUID of the event to deactivate' })
  @ApiResponse({ status: 200, description: 'Event successfully deactivated.' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('producer')
  async deactivateEvent(@Param('id', ParseUUIDPipe) id: string) {
    // El servicio y el repositorio se encargan de validar la existencia y gritar si no existe
    await this.eventsService.deactivateEvent(id);

    // Mantenemos tu formato consistente de respuesta de éxito para el Frontend
    return {
      success: true,
      message:
        'The event and its visibility have been successfully deactivated',
    };
  }
}
