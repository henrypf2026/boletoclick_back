import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, Between } from 'typeorm';
import { Event } from './entities/event.entity';
import { UpdateEventDto } from './dto/update-event.dto';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { EventStatus } from '../common/enums/event-status.enum';
import { Ticket } from '../tickets/entities/ticket.entity';

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

  // Modificado: El público en general ahora solo ve eventos aprobados
  async getAllEvents(): Promise<Event[]> {
    return await this.ormEventsRepository.find({
      relations: {
        venue: { municipality: { province: true } },
        category: true,
        ticketTypes: true,
        coupons: true,
      },
      where: {
        status: EventStatus.APPROVED, // Cambiado de Not(DRAFT) a APPROVED
      },
      order: { createdAt: 'DESC' },
    });
  }

  // Para el panel de Admin. Trae TODOS los eventos sin filtrar por status
  // (APPROVED, REJECTED, etc.), a diferencia de getAllEvents() que es para
  // el catálogo público y solo trae APPROVED.
  async getAllEventsForAdmin(): Promise<Event[]> {
    return await this.ormEventsRepository.find({
      relations: {
        venue: { municipality: { province: true } },
        category: true,
        ticketTypes: true,
        coupons: true,
        producer: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // Legado: ya no se usa en el flujo principal (la moderación previa se
  // eliminó, los eventos se publican como APPROVED directamente al crear).
  // Se deja por si en el futuro se reactiva algún caso de revisión manual.
  async getPendingEvents(): Promise<Event[]> {
    return await this.ormEventsRepository.find({
      relations: {
        venue: { municipality: { province: true } },
        category: true,
        ticketTypes: true,
        coupons: true,
      },
      where: {
        status: EventStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // Nuevo: Permite guardar o persistir cualquier cambio directo en el evento (como el status)
  async saveEvent(event: Event): Promise<Event> {
    return await this.ormEventsRepository.save(event);
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
      relations: { ticketTypes: true, category: true, venue: true },
    });
  }

  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
    producerId?: string,
  ): Promise<Event> {
    const whereClause: any = producerId ? { id, producerId } : { id };

    const event = await this.ormEventsRepository.findOne({
      where: whereClause,
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

  // async deactivateEvent(id: string, producerId?: string): Promise<void> {
  //   const criteria: any = producerId ? { id, producerId } : id;

  //   const result = await this.ormEventsRepository.update(criteria, {
  //     status: EventStatus.CANCELLED,
  //   });

  //   if ((result.affected ?? 0) === 0) {
  //     throw new NotFoundException(
  //       `Event with ID ${id} not found or already deactivated`,
  //     );
  //   }
  // }

  async desactivateEvent(id: string, producerId?: string): Promise<void> {
    await this.ormEventsRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager): Promise<void> => {
        await transactionalEntityManager
          .createQueryBuilder()
          .update('tickets')
          .set({ allowEntrance: false })
          .where(
            `ticketTypeId IN (
              SELECT id FROM ticket_types WHERE "eventId" = :id
            )`,
            { id },
          )
          .execute();

        const criteria: any = producerId ? { id: id, producerId } : { id: id };

        const updateResult = await transactionalEntityManager.update(
          Event,
          criteria,
          { status: EventStatus.CANCELLED },
        );

        if ((updateResult.affected ?? 0) === 0) {
          throw new NotFoundException(
            `Event with ID ${id} not found or already deactivated`,
          );
        }

        const subQuery = transactionalEntityManager
          .createQueryBuilder()
          .select('ticketType.id')
          .from(TicketType, 'ticketType')
          .where('ticketType.eventId = :eventId')
          .getQuery();

        await transactionalEntityManager
          .createQueryBuilder()
          .update(Ticket)
          .set({ allowEntrance: false })
          .where(`ticketTypeId IN (${subQuery})`)
          .setParameter('eventId', id)
          .execute();

        // 🛠️ NUEVO CAMBIO: Cancelar las órdenes asociadas al evento
        await transactionalEntityManager
          .createQueryBuilder()
          .update('orders')
          .set({ status: 'CANCELLED' })
          .where(
            `id IN (
              SELECT "orderId" FROM tickets
              WHERE "ticketTypeId" IN (
                SELECT id FROM ticket_types WHERE "eventId" = :eventId
              )
            )`,
            { eventId: id },
          )
          .execute();
      },
    );
  }

  async findUpcomingEvents(fromDate: Date, toDate: Date, limit: number) {
    return await this.ormEventsRepository.find({
      where: {
        eventDate: Between(fromDate.toISOString(), toDate.toISOString()),
        status: EventStatus.APPROVED, // Asegura que solo se sugieran eventos aprobados
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

  // 🛠️ CAMBIO: status: EventStatus.ACTIVE -> EventStatus.APPROVED
  // Unificamos: ya no existen dos colas paralelas para "evento visible".
  // APPROVED es ahora el único estado que significa "publicado al público",
  // y se asigna automáticamente al crear (ver events.service.ts).
  async getActiveEventsForChatbot(): Promise<Event[]> {
    return await this.ormEventsRepository.find({
      where: {
        status: EventStatus.APPROVED,
      },
      relations: {
        venue: { municipality: { province: true } },
        category: true,
        ticketTypes: true,
      },
      order: {
        eventDate: 'ASC',
      },
      take: 10,
    });
  }

  async searchActiveEventsForChatbot(search: string): Promise<Event[]> {
    return await this.ormEventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('venue.municipality', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.ticketTypes', 'ticketTypes')
      .where('event.status = :status', { status: EventStatus.APPROVED })
      .andWhere(
        `(
        LOWER(event.title) LIKE LOWER(:search)
        OR LOWER(event.description) LIKE LOWER(:search)
        OR LOWER(venue.name) LIKE LOWER(:search)
        OR LOWER(venue.address) LIKE LOWER(:search)
        OR LOWER(municipality.name) LIKE LOWER(:search)
        OR LOWER(province.name) LIKE LOWER(:search)
      )`,
        { search: `%${search}%` },
      )
      .orderBy('event.eventDate', 'ASC')
      .take(10)
      .getMany();
  }

  async searchActiveEventsByLocationForChatbot(
    location: string,
  ): Promise<Event[]> {
    return await this.ormEventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('venue.municipality', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.ticketTypes', 'ticketTypes')
      .where('event.status = :status', { status: EventStatus.APPROVED })
      .andWhere(
        `(
        LOWER(venue.name) LIKE LOWER(:location)
        OR LOWER(venue.address) LIKE LOWER(:location)
        OR LOWER(municipality.name) LIKE LOWER(:location)
        OR LOWER(province.name) LIKE LOWER(:location)
      )`,
        { location: `%${location}%` },
      )
      .orderBy('event.eventDate', 'ASC')
      .take(10)
      .getMany();
  }
}
