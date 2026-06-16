import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, Between } from 'typeorm';
import { Event } from './entities/event.entity';
import { UpdateEventDto } from './dto/update-event.dto';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { EventStatus } from '../common/enums/event-status.enum';
import { Ticket } from '../tickets/entities/ticket.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';

@Injectable()
export class EventsRepository {
  constructor(
    @InjectRepository(Event)
    private readonly ormEventsRepository: Repository<Event>,
  ) {}

  async createEvent(
    eventData: Partial<Event>,
    transactionalManager?: EntityManager,
  ): Promise<Event> {
    const manager = transactionalManager || this.ormEventsRepository.manager;

    const newEvent = manager.create(Event, eventData);
    return await manager.save(Event, newEvent);
  }

  async getAllEvents(): Promise<Event[]> {
    return await this.ormEventsRepository.find({
      relations: {
        venue: { municipality: { province: true } },
        category: true,
        ticketTypes: true,
        coupons: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getEventById(id: string): Promise<Event> {
    const foundEvent = await this.ormEventsRepository.findOne({
      where: { id },
      relations: {
        ticketTypes: true,
        venue: { municipality: { province: true } },
        category: true,
        coupons: true,
      },
    });

    if (!foundEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return foundEvent;
  }

  async getEventsByProducerId(producerId: string): Promise<Event[]> {
    return await this.ormEventsRepository.find({
      where: {
        producer: { id: producerId },
      },
      order: { createdAt: 'DESC' },
      relations: { ticketTypes: true },
    });
  }

  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.ormEventsRepository.findOne({
      where: { id },
      relations: { ticketTypes: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const { ticketTypes, ...eventDetails } = updateEventDto;

    Object.assign(event, eventDetails);

    if (ticketTypes && Array.isArray(ticketTypes)) {
      event.ticketTypes = ticketTypes.map((ticketDto: any) => {
        const ticketExistente = event.ticketTypes.find(
          (t) => t.name === ticketDto.name,
        );

        if (ticketExistente) {
          return Object.assign(ticketExistente, ticketDto);
        } else {
          return this.ormEventsRepository.manager.create(
            'TicketType',
            ticketDto,
          );
        }
      });
    }

    return await this.ormEventsRepository.save(event);
  }

  async deactivateEvent(id: string): Promise<void> {
    const result = await this.ormEventsRepository.update(id, {
      status: EventStatus.CANCELLED,
    });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(
        `Event with ID ${id} not found or already deactivated`,
      );
    }
  }

  async desactivateEvent(id: string): Promise<void> {
    // En tu EventService
    await this.ormEventsRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager): Promise<void> => {
        // 1. Cambiar el estado 'permite' a false en la tabla Tickets buscando por el ID del evento
        await transactionalEntityManager
          .createQueryBuilder()
          .update('tickets') // Nombre exacto de tu tabla o la clase Entidad Ticket
          // Reemplaza 'permite' por el nombre exacto de tu columna en la base de datos (ej: permite_entrada)
          .set({ allowEntrance: false })
          // Filtramos usando una subconsulta para hallar los tickets vinculados a los ticketTypes del evento
          .where(
            `ticketTypeId IN (
              SELECT id FROM ticket_types WHERE "eventId" = :id
            )`,
            { id },
          )
          .execute();

        await transactionalEntityManager.update(
          Event,
          { id: id }, // 1. Condición: Buscar el evento por su ID
          { status: EventStatus.CANCELLED }, // 2. Modificación: Cambiar el estado a CANCELLED
        );

        const subQuery = transactionalEntityManager
          .createQueryBuilder()
          .select('ticketType.id')
          .from(TicketType, 'ticketType')
          .where('ticketType.eventId = :eventId')
          .getQuery(); // Esto genera el texto SQL interno: (SELECT id FROM ticket_types WHERE eventId = ...)

        // 2. Ejecutamos el UPDATE masivo inyectando la subconsulta en el WHERE
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Ticket)
          .set({ allowEntrance: false })
          .where(`ticketTypeId IN (${subQuery})`) // Inyectamos de forma segura la subconsulta estructurada
          .setParameter('eventId', id) // El parámetro se mapea correctamente aquí
          .execute();
      },
    );
  }

  async findUpcomingEvents(fromDate: Date, toDate: Date, limit: number) {
    return await this.ormEventsRepository.find({
      where: {
        eventDate: Between(fromDate.toISOString(), toDate.toISOString()),
      },
      relations: {
        venue: {
          municipality: {
            province: true,
          },
        },
        category: true,
        ticketTypes: true,
        coupons: true,
      },
      order: {
        eventDate: 'ASC',
      },
      take: limit,
    });
  }
}
