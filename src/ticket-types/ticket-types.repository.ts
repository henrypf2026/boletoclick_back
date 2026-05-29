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

  /**
   * 📦 Crea múltiples localidades en bloque (Bulk Insert).
   * Soporta transacciones si el servicio le pasa el transactionalManager del QueryRunner.
   */
  async createBulkTickets(
    ticketsData: Partial<TicketType>[],
    transactionalManager?: EntityManager,
  ): Promise<TicketType[]> {
    // Si viene dentro de una transacción usa su manager, si no, el del repositorio aislado
    const manager =
      transactionalManager || this.ormTicketTypesRepository.manager;

    const newTickets = manager.create(TicketType, ticketsData);
    return await manager.save(TicketType, newTickets);
  }

  /**
   * 📋 Obtiene todas las localidades de un evento específico.
   */
  async getTicketTypesByEvent(eventId: string): Promise<TicketType[]> {
    return await this.ormTicketTypesRepository.find({
      where: { eventId },
      order: { price: 'ASC' }, // Las lista de la más barata a la más cara
    });
  }

  /**
   * 🔍 Busca una localidad específica por su ID.
   */
  async getTicketTypeById(id: string): Promise<TicketType> {
    const foundTicketType = await this.ormTicketTypesRepository.findOne({
      where: { id },
    });

    if (!foundTicketType) {
      throw new NotFoundException(`Ticket type with ID ${id} not found`);
    }

    return foundTicketType;
  }

  /**
   * 🗑️ Desactivación lógica (Soft Delete) de una localidad.
   */
  async deactivateTicketType(id: string): Promise<void> {
    const result = await this.ormTicketTypesRepository.softDelete({ id });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(
        `Ticket type with ID ${id} not found or already deleted`,
      );
    }
  }
}
