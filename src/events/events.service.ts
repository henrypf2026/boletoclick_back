import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
  forwardRef,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { TicketTypesService } from '../ticket-types/ticket-types.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { VenuesService } from '../venues/venues.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { EventStatus } from '../common/enums/event-status.enum';

@Injectable()
export class EventsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly eventsRepository: EventsRepository,
    private readonly ticketTypesService: TicketTypesService,
    private readonly venuesService: VenuesService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    private readonly userService: UsersService,
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
      const { ticketTypes, poster, status, ...eventDetails } = eventData;
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
          // 🛠️ CAMBIO DE REGLA DE NEGOCIO: los eventos ya no pasan por
          // moderación previa. Se publican automáticamente como APPROVED,
          // y el admin solo puede bajarlos (REJECTED) después si algo no
          // le convence. (Antes: EventStatus.PENDING)
          status: EventStatus.APPROVED,
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
        /* const producer = await this.userService.findUserById(producerId);

        await this.emailService.sendNewEventEmail(
          producer,
          savedEvent,
          totalStock,
        );*/
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

  async updateEventStatus(id: string, status: EventStatus): Promise<Event> {
    const event = await this.eventsRepository.getEventById(id);

    event.status = status;

    return await this.eventsRepository.saveEvent(event);
  }

  // 🛠️ FIX: este método estaba duplicado dos veces en el archivo (idéntico),
  // lo cual no compila en TypeScript. Dejamos una sola definición.
  async getAllEvents(): Promise<(Event & { isSoldOut: boolean })[]> {
    const events = await this.eventsRepository.getAllEvents();
    return events.map((e) => this.enrichWithSoldOut(e));
  }

  // Para el panel de Admin (catálogo unificado). Trae TODOS los eventos sin
  // filtrar por status, para que el admin pueda ver tanto activos como
  // rechazados (el filtrado entre esos dos lo hace el front).
  async getAllEventsForAdmin(): Promise<(Event & { isSoldOut: boolean })[]> {
    const events = await this.eventsRepository.getAllEventsForAdmin();
    return events.map((e) => this.enrichWithSoldOut(e));
  }

  async getPendingEvents(): Promise<(Event & { isSoldOut: boolean })[]> {
    const pendingEvents = await this.eventsRepository.getPendingEvents();
    return pendingEvents.map((e) => this.enrichWithSoldOut(e));
  }

  async getEventsByProducerId(
    producerId: string,
  ): Promise<(Event & { isSoldOut: boolean })[]> {
    const events =
      await this.eventsRepository.getEventsByProducerId(producerId);
    return events.map((e) => this.enrichWithSoldOut(e));
  }

  async getEventById(id: string): Promise<Event & { isSoldOut: boolean }> {
    const event = await this.eventsRepository.getEventById(id);
    return this.enrichWithSoldOut(event);
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

  private enrichWithSoldOut(event: Event): Event & { isSoldOut: boolean } {
    const isSoldOut =
      event.ticketTypes.length > 0 &&
      event.ticketTypes.every((tt) => tt.stock === 0);

    return { ...event, isSoldOut };
  }

  async getActiveEventsForChatbot(): Promise<Event[]> {
    return await this.eventsRepository.getActiveEventsForChatbot();
  }

  async searchActiveEventsForChatbot(search: string): Promise<Event[]> {
    return await this.eventsRepository.searchActiveEventsForChatbot(search);
  }

  async searchActiveEventsByLocationForChatbot(
    location: string,
  ): Promise<Event[]> {
    return await this.eventsRepository.searchActiveEventsByLocationForChatbot(
      location,
    );
  }
}
