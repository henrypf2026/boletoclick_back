import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, Between } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { UpdateEventDto } from './dto/update-event.dto';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';

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
      status: EventStatus.INACTIVE,
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

        // 2. Borramos lógicamente los ticketTypes asociados al evento
        await transactionalEntityManager.softDelete(TicketType, {
          event: { id },
        });

        await transactionalEntityManager.update(Event, id, {
          status: EventStatus.INACTIVE,
        });

        // 3. Borramos lógicamente el evento principal
        const result = await transactionalEntityManager.softDelete(Event, {
          id,
        });

        if ((result.affected ?? 0) === 0) {
          throw new NotFoundException(
            `Event with ID ${id} not found or already deactivated`,
          );
        }
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
