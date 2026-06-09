import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly ormTicketRepository: Repository<Ticket>,
  ) {}

  async findTicketsByUser(userId: string): Promise<Ticket[]> {
    return await this.ormTicketRepository.find({
      where: {
        order: {
          user: { id: userId },
        },
      },
      relations: {
        ticketType: true,
        order: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findTicketByIdAndUser(
    id: string,
    userId: string,
  ): Promise<Ticket | null> {
    return await this.ormTicketRepository.findOne({
      where: {
        id,
        order: {
          user: { id: userId },
        },
      },
      relations: {
        ticketType: true,
        order: true,
      },
    });
  }

  async findAllTicketsByProducer(
    producerId: string,
    orderId?: string,
  ): Promise<Ticket[]> {
    return await this.ormTicketRepository.find({
      where: {
        ticketType: {
          event: {
            producer: { id: producerId },
          },
        },
        ...(orderId ? { order: { id: orderId } } : {}),
      },
      relations: {
        ticketType: {
          event: true,
        },
        order: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async createBulkTickets(ticketsData: Partial<Ticket>[]): Promise<Ticket[]> {
    return await this.ormTicketRepository.save(ticketsData);
  }

  async countActiveTicketsByUser(userId: string): Promise<number> {
    return await this.ormTicketRepository
      .createQueryBuilder('ticket')
      // 1. Unimos con 'orders' (alias 'o') para poder llegar al usuario
      .innerJoin('ticket.order', 'o')
      // 2. Unimos con 'eventos' (alias 'e') para revisar la fecha del evento
      .innerJoin('ticket.evento', 'e')
      // 3. Filtramos por el ID del usuario que está en la orden
      .where('o.userId = :userId', { userId })
      // 4. Filtramos para que solo cuente eventos que aún no han sucedido
      .andWhere('e.fecha_ejecucion >= :hoy', { hoy: new Date() })
      // Devuelve solo el número total de filas encontradas (muy rápido)
      .getCount();
  }
}
