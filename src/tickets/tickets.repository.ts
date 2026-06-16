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

  async createBulkTickets(
    ticketsData: Partial<Ticket>[],
    ticketTypeId: string,
  ): Promise<Ticket[]> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        // 3. OBTENER LOS REPOSITORIOS TRANSACCIONALES
        // Esto hace que los repositorios usen el mismo canal y aislamiento de la transacción
        const txTicketTypeRepository =
          transactionalEntityManager.getRepository(TicketType); // Alternativa directa por Entidad
        const txTicketRepository =
          transactionalEntityManager.getRepository(Ticket); // Alternativa directa por Entidad

        try {
          const ticketType = await txTicketTypeRepository.findOneBy({
            id: ticketTypeId,
          });

          if (!ticketType)
            throw new BadRequestException('Ticke type no encontrado');

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
          // Si ocurre CUALQUIER error, TypeORM hace el ROLLBACK automáticamente
          // y deshace los cambios en la base de datos.
          const message =
            error instanceof Error ? error.message : String(error);
          throw new InternalServerErrorException(
            `Error en la transacción: ${message}`,
          );
        }
      },
    );

    // return await this.ormTicketRepository.save(ticketsData);
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
