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
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/user-payload.interface';
// import { FileUploadService } from '../file-upload/file-upload.service';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    // private readonly fileUploadService: FileUploadService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER)
  @Post()
  // @ApiConsumes('multipart/form-data')
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
  // @UseInterceptors(FileInterceptor('poster'))
  async createEvent(
    @CurrentUser() user: UserPayload,
    @Body() eventData: CreateEventDto,
    // @UploadedFile() file: Express.Multer.File,
  ): Promise<Event> {
    // const posterUrl = await this.fileUploadService.uploadImage(file);

    const posterUrl =
      'https://res.cloudinary.com/boletoclick/image/upload/v12345/default-poster.jpg';

    return await this.eventsService.createEvent(user.id, eventData, posterUrl);
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
  @ApiResponse({ status: 404, description: 'Not Found. Event does not exist.' })
  async getEventById(@Param('id', ParseUUIDPipe) id: string): Promise<Event> {
    return await this.eventsService.getEventById(id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.PRODUCER, Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate an event (Soft Delete)' })
  @ApiParam({ name: 'id', description: 'The UUID of the event to deactivate' })
  @ApiResponse({ status: 200, description: 'Event successfully deactivated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async deactivateEvent(@Param('id', ParseUUIDPipe) id: string) {
    await this.eventsService.deactivateEvent(id);

    return {
      success: true,
      message:
        'The event and its visibility have been successfully deactivated',
    };
  }
}
