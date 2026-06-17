import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { TicketTypesService } from '../ticket-types/ticket-types.service';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly eventsRepository: EventsRepository,
    private readonly ticketTypesService: TicketTypesService,
  ) {}

  //revisar este método: cómo va a ser la lógica? se puede crear un evento sin crear sus localidades y dejarlas para después? o va a ser obligatorio que las cree el producer en ese momento?
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
        `Failed to create event and tickets transactionally: ${message}`,
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
      throw new ForbiddenException('You do not own this event');
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
      throw new ForbiddenException('You do not own this event');
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
