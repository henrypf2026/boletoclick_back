import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Event } from './entities/event.entity';
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
      select: {
        venue: {
          id: true,
          name: true,
          address: true,
          capacity: true,
          imgUrl: true,
          latitude: true,
          longitude: true,
          municipality: {
            id: true,
            name: true,
            province: {
              id: true,
              name: true,
              abbreviation: true,
            },
          },
        },
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
      select: {
        venue: {
          id: true,
          name: true,
          address: true,
          capacity: true,
          imgUrl: true,
          latitude: true,
          longitude: true,
          municipality: {
            id: true,
            name: true,
            province: {
              id: true,
              name: true,
              abbreviation: true,
            },
          },
        },
      },
    });

    if (!foundEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return foundEvent;
  }

  async desactivateEvent(id: string): Promise<void> {
    // En tu EventService
    await this.ormEventsRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager): Promise<void> => {
        // 1. Borramos lógicamente los tickets asociados al evento
        await transactionalEntityManager.softDelete(TicketType, {
          event: { id },
        });

        // 2. Borramos lógicamente el evento principal
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
}
