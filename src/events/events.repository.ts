import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Event } from './entities/event.entity';

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
        venue: true,
        category: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getEventById(id: string): Promise<Event> {
    const foundEvent = await this.ormEventsRepository.findOne({
      where: { id },
      relations: {
        ticketTypes: true,
        venue: true,
        category: true,
      },
    });

    if (!foundEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return foundEvent;
  }

  async deactivateEvent(id: string): Promise<void> {
    const result = await this.ormEventsRepository.softDelete({ id });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(
        `Event with ID ${id} not found or already deactivated`,
      );
    }
  }
}
