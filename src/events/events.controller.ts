import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OwnerGuard } from '../common/guards/owner.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { EventStatus } from '../common/enums/event-status.enum'; // Asegúrate de que apunte a tu enum
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/user-payload.interface';
import { FileUploadService } from '../file-upload/file-upload.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('events')
@Controller('events')
@SkipThrottle()
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
  @Post()
  @ApiOperation({
    summary: 'Create a new event with its ticket types',
  })
  @ApiResponse({
    status: 201,
    description: 'Event and ticket types successfully created.',
    type: Event,
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Producers only.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateEventDto })
  @UseInterceptors(FileInterceptor('poster'))
  async createEvent(
    @CurrentUser() user: UserPayload,
    @Body() eventData: CreateEventDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 2, // 2MB
            errorMessage: 'Supera el peso maximo de 2MB',
          }),
          new FileTypeValidator({
            fileType: /(.jpg|.png|.gif|.webp|.jpeg)/,
            errorMessage: 'Extensión del archivo no es valida',
          }),
        ],
      }),
    )
    poster: Express.Multer.File,
  ): Promise<Event> {
    const posterUrl = await this.fileUploadService.uploadEventImage(poster);

    return await this.eventsService.createEvent(user.id, eventData, posterUrl);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active and approved events' })
  @ApiResponse({
    status: 200,
    description: 'List of events retrieved successfully.',
    type: [Event],
  })
  async getAllEvents(): Promise<Event[]> {
    return await this.eventsService.getAllEvents();
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/pending')
  @ApiOperation({
    summary: 'Get all pending events for moderation (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending events.',
    type: [Event],
  })
  async getPendingEvents(): Promise<Event[]> {
    return await this.eventsService.getPendingEvents();
  }

  // 🆕 NUEVO: Endpoint para el panel de Admin -> pestaña "Catálogo Activo".
  // A diferencia de GET / (solo APPROVED) y GET /admin/pending (solo PENDING),
  // este devuelve TODOS los eventos sin filtrar por status, para que el admin
  // pueda ver aprobados y rechazados conviviendo en la misma pantalla.
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  @ApiOperation({
    summary:
      'Get all events regardless of status, for the admin catalog view (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all events, any status.',
    type: [Event],
  })
  async getAllEventsForAdmin(): Promise<Event[]> {
    return await this.eventsService.getAllEventsForAdmin();
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Approve or reject an event (Admin only)' })
  @ApiParam({ name: 'id', description: 'The UUID of the event' })
  @ApiBody({
    description: 'Nuevo estado del evento.',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(EventStatus),
          example: EventStatus.APPROVED,
          description: 'Estado que se asignará al evento.',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Event status updated successfully.',
    type: Event,
  })
  async updateEventStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: EventStatus,
  ): Promise<Event> {
    return await this.eventsService.updateEventStatus(id, status);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
  @Get('producer')
  @ApiOperation({
    summary: 'Get all events belonging to the logged-in producer',
  })
  @ApiResponse({
    status: 200,
    description: 'List of producer events retrieved successfully.',
    type: [Event],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Producers only.' })
  async getEventsByProducerId(
    @CurrentUser() user: UserPayload,
  ): Promise<Event[]> {
    return await this.eventsService.getEventsByProducerId(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific event by its ID along with its ticket types',
  })
  @ApiParam({ name: 'id', description: 'The UUID of the event' })
  @ApiResponse({ status: 200, description: 'Event found.', type: Event })
  @ApiResponse({ status: 404, description: 'Not Found. Event does not exist.' })
  async getEventById(@Param('id', ParseUUIDPipe) id: string): Promise<Event> {
    return await this.eventsService.getEventById(id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard, OwnerGuard)
  @Roles(Role.PRODUCER)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update an event and its ticket types from producer dashboard',
  })
  @ApiParam({ name: 'id', description: 'The UUID of the event to update' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully.',
    type: Event,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  @ApiBody({ type: UpdateEventDto })
  async updateEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: UserPayload,
  ): Promise<Event> {
    return await this.eventsService.updateEvent(id, updateEventDto, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard, OwnerGuard)
  @Roles(Role.PRODUCER, Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate an event (Change status to INACTIVE)' })
  @ApiParam({ name: 'id', description: 'The UUID of the event to deactivate' })
  @ApiResponse({ status: 200, description: 'Event successfully deactivated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async desactivateEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    await this.eventsService.desactivateEvent(id, user.id);

    return {
      success: true,
      message:
        'The event and its visibility have been successfully deactivated',
    };
  }
}
