import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';

@Injectable()
export class TicketsRepository {
  constructor(
    private readonly dataSource: DataSource,
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

  // ADMIN — todos los tickets sin filtro de producer
  async findAllTickets(orderId?: string): Promise<Ticket[]> {
    return await this.ormTicketRepository.find({
      where: orderId ? { order: { id: orderId } } : {},
      relations: {
        ticketType: {
          event: true,
        },
        order: {
          user: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Escaneo — busca por qrCode
  async findByQrCode(qrCode: string): Promise<Ticket | null> {
    return await this.ormTicketRepository.findOne({
      where: { qrCode },
      relations: {
        ticketType: {
          event: true,
        },
        order: true,
      },
    });
  }

  // Guardar cambios sobre un ticket existente (usado en escaneo)
  async save(ticket: Ticket): Promise<Ticket> {
    return await this.ormTicketRepository.save(ticket);
  }

  async createBulkTickets(
    ticketsData: Partial<Ticket>[],
    ticketTypeId: string,
  ): Promise<Ticket[]> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const txTicketTypeRepository =
          transactionalEntityManager.getRepository(TicketType);
        const txTicketRepository =
          transactionalEntityManager.getRepository(Ticket);

        try {
          const ticketType = await txTicketTypeRepository.findOneBy({
            id: ticketTypeId,
          });

          if (!ticketType)
            throw new BadRequestException('Ticket type no encontrado');

          const newStock = ticketType.stock - ticketsData.length;

          if (newStock < 0)
            throw new BadRequestException(
              `Solo se disponen de ${ticketType.stock} entradas`,
            );

          await txTicketTypeRepository.update(ticketTypeId, {
            stock: newStock,
          });

          const savedTickets = await txTicketRepository.save(ticketsData);

          return savedTickets;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          throw new InternalServerErrorException(
            `Error en la transacción: ${message}`,
          );
        }
      },
    );
  }

  async countActiveTicketsByUser(userId: string): Promise<number> {
    return await this.ormTicketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.order', 'o')
      .innerJoin('ticket.evento', 'e')
      .where('o.userId = :userId', { userId })
      .andWhere('e.fecha_ejecucion >= :hoy', { hoy: new Date() })
      .getCount();
  }
}