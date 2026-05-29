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

  /**
   * 🏗️ Crea un evento en la base de datos.
   * Soporta transacciones si se le pasa el transactionalManager desde el servicio.
   */
  async createEvent(
    eventData: Partial<Event>,
    transactionalManager?: EntityManager,
  ): Promise<Event> {
    // 💡 Si viene un manager de la transacción (QueryRunner) lo usamos,
    // de lo contrario, usamos el manager estándar del repositorio aislado.
    const manager = transactionalManager || this.ormEventsRepository.manager;

    const newEvent = manager.create(Event, eventData);
    return await manager.save(Event, newEvent);
  }

  /**
   * 📋 Obtiene todos los eventos activos del sistema.
   */
  async getAllEvents(): Promise<Event[]> {
    return await this.ormEventsRepository.find({
      // 💡 Cambiado de ['venue', 'category'] al nuevo formato de objeto:
      // relations: {
      //   // venue: true,
      //   // category: true,
      // },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 🔍 Busca un evento específico por su ID.
   */
  async getEventById(id: string): Promise<Event> {
    const foundEvent = await this.ormEventsRepository.findOne({
      where: { id },
      // 💡 Cambiado de ['ticketTypes', 'venue', 'category'] a objeto:
      relations: {
        ticketTypes: true,
        // venue: true,
        // category: true,
      },
    });

    if (!foundEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return foundEvent;
  }

  /**
   * 🗑️ Aplica un borrado lógico (Soft Delete) al evento.
   * El controlador y el servicio se llamarán igual para cumplir la trazabilidad vertical.
   */
  async deactivateEvent(id: string): Promise<void> {
    const result = await this.ormEventsRepository.softDelete({ id });

    // Aplicamos tu lógica defensiva con el operador "??"
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(
        `Event with ID ${id} not found or already deactivated`,
      );
    }
  }
}
