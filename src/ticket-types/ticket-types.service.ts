import { Injectable } from '@nestjs/common';
import { TicketTypesRepository } from './ticket-types.repository';
import { TicketType } from './entities/ticket-type.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class TicketTypesService {
  constructor(private readonly ticketTypesRepository: TicketTypesRepository) {}

  async createBulkTicketTypes(
    ticketTypesData: Partial<TicketType>[],
    manager?: EntityManager,
  ): Promise<TicketType[]> {
    return await this.ticketTypesRepository.createBulkTicketTypes(
      ticketTypesData,
      manager,
    );
  }

  async getTicketTypesByEvent(eventId: string): Promise<TicketType[]> {
    return await this.ticketTypesRepository.getTicketTypesByEvent(eventId);
  }

  async getTicketTypeById(id: string): Promise<TicketType> {
    return await this.ticketTypesRepository.getTicketTypeById(id);
  }

  async deactivateTicketType(id: string): Promise<void> {
    await this.ticketTypesRepository.deactivateTicketType(id);
  }

  async getTicketTypesByZone(zone: string): Promise<TicketType[]> {
  return await this.ticketTypesRepository.getTicketTypesByZone(zone);
}
}
