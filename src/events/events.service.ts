import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { TicketTypesService } from '../ticket-types/ticket-types.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { VenuesService } from '../venues/venues.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly eventsRepository: EventsRepository,
    private readonly ticketTypesService: TicketTypesService,
    private readonly venuesService: VenuesService,
  ) {}

  async createEvent(
    producerId: string,
    eventData: CreateEventDto,
    posterUrl: string,
  ): Promise<Event> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { ticketTypes, poster, ...eventDetails } = eventData;
      console.log({ eventDetails });
      const totalStock = (ticketTypes || []).reduce(
        (sum, t) => sum + Number((t as any).stock || 0),
        0,
      );

      const venue = await this.venuesService.findVenueById(eventData.venueId);

      if (totalStock > venue.capacity) {
        throw new BadRequestException(
          `La suma de stock (${totalStock}) excede la capacidad del venue (${venue.capacity}).`,
        );
      }

      const savedEvent = await this.eventsRepository.createEvent(
        {
          ...eventDetails,
          producerId,
          posterUrl,
        },
        queryRunner.manager,
      );

      if (ticketTypes && ticketTypes.length > 0) {
        const tiquesConIdDelEvento = ticketTypes.map((ticket) => ({
          ...ticket,
          eventId: savedEvent.id,
        }));

        const savedTickets =
          await this.ticketTypesService.createBulkTicketTypes(
            tiquesConIdDelEvento,
            queryRunner.manager,
          );

        savedEvent.ticketTypes = savedTickets;
      }

      await queryRunner.commitTransaction();
      return savedEvent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Falla al crear el evento y las localidades a través de una transacción: ${message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ): Promise<Event> {
    const event = await this.getEventById(id);

    if (event.producerId !== userId) {
      throw new ForbiddenException(
        'No tienes autorización para editar este evento',
      );
    }

    return await this.eventsRepository.updateEvent(id, updateEventDto, userId);
  }

  async getAllEvents(): Promise<Event[]> {
    return await this.eventsRepository.getAllEvents();
  }

  async getEventsByProducerId(producerId: string): Promise<Event[]> {
    return await this.eventsRepository.getEventsByProducerId(producerId);
  }

  async getEventById(id: string): Promise<Event> {
    return await this.eventsRepository.getEventById(id);
  }

  async desactivateEvent(id: string, userId: string): Promise<void> {
    const event = await this.getEventById(id);

    if (event.producerId !== userId) {
      throw new ForbiddenException(
        'No tienes autorización para editar este evento',
      );
    }

    await this.eventsRepository.desactivateEvent(id, userId);
  }

  async findUpcomingEvents(fromDate: Date, toDate: Date, limit: number) {
    return await this.eventsRepository.findUpcomingEvents(
      fromDate,
      toDate,
      limit,
    );
  }
}
