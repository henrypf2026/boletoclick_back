import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TicketType } from './entities/ticket-type.entity';

@Injectable()
export class TicketTypesRepository {
  constructor(
    @InjectRepository(TicketType)
    private readonly ormTicketTypesRepository: Repository<TicketType>,
  ) {}

  async createBulkTicketTypes(
    ticketsData: Partial<TicketType>[],
    transactionalManager?: EntityManager,
  ): Promise<TicketType[]> {
    const manager =
      transactionalManager || this.ormTicketTypesRepository.manager;
    const newTickets = manager.create(TicketType, ticketsData);
    return await manager.save(TicketType, newTickets);
  }

  async getTicketTypesByEvent(eventId: string): Promise<TicketType[]> {
    return await this.ormTicketTypesRepository.find({
      where: { eventId },
      order: { price: 'ASC' },
    });
  }

  async getTicketTypesByZone(zone: string): Promise<TicketType[]> {
    return await this.ormTicketTypesRepository.find({
      where: { zone },
      order: { price: 'ASC' },
    });
  }

  async getTicketTypeById(id: string): Promise<TicketType> {
    const foundTicketType = await this.ormTicketTypesRepository.findOne({
      where: { id },
    });
    if (!foundTicketType) {
      throw new NotFoundException(`Ticket type with ID ${id} not found`);
    }
    return foundTicketType;
  }

  async deactivateTicketType(id: string): Promise<void> {
    const result = await this.ormTicketTypesRepository.softDelete({ id });
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(
        `Ticket type with ID ${id} not found or already deleted`,
      );
    }
  }
}