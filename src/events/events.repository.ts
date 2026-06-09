import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
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
    const result = await this.ormEventsRepository.softDelete({ id });

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
