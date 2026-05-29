import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { TicketTypesRepository } from '../ticket-types/ticket-types.repository';

@Injectable()
export class EventsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly eventsRepository: EventsRepository,
    private readonly ticketTypesRepository: TicketTypesRepository,
  ) {}

  /**
   * 🏗️ Caso de Uso: Crear un evento junto con sus localidades en una transacción atómica.
   * 💡 Nombre alineado perfectamente con el repositorio: 'createEvent'
   */
  async createEvent(
    producerId: string,
    eventData: CreateEventDto,
    posterUrl: string,
  ): Promise<Event> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { ticketTypes, ...eventDetails } = eventData;

      // Llamamos a 'createEvent' en el repositorio
      const savedEvent = await this.eventsRepository.createEvent(
        {
          ...eventDetails,
          producerId,
          posterUrl,
        },
        queryRunner.manager,
      );

      if (ticketTypes && ticketTypes.length > 0) {
        const tiquesConIdDelEvento = ticketTypes.map((ticket) => ({
          ...ticket,
          eventId: savedEvent.id,
        }));

        const savedTickets = await this.ticketTypesRepository.createBulkTickets(
          tiquesConIdDelEvento,
          queryRunner.manager,
        );

        savedEvent.ticketTypes = savedTickets;
      }

      await queryRunner.commitTransaction();
      return savedEvent;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // 💡 Validamos el tipo de error para calmar a TypeScript
      const message = error instanceof Error ? error.message : String(error);

      throw new InternalServerErrorException(
        `Failed to create event and tickets transactionally: ${message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 📋 Caso de Uso: Obtener la lista completa de eventos activos.
   */
  async getAllEvents(): Promise<Event[]> {
    return await this.eventsRepository.getAllEvents();
  }

  /**
   * 🔍 Caso de Uso: Buscar un evento por su ID.
   */
  async getEventById(id: string): Promise<Event> {
    return await this.eventsRepository.getEventById(id);
  }

  /**
   * 🗑️ Caso de Uso: Desactivar un evento (Soft Delete).
   */
  async deactivateEvent(id: string): Promise<void> {
    await this.eventsRepository.deactivateEvent(id);
  }
}
