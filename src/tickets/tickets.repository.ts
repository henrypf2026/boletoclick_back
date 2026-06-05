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
}
