import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TicketsRepository } from './tickets.repository';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async findTicketsByUser(userId: string): Promise<Ticket[]> {
    return await this.ticketsRepository.findTicketsByUser(userId);
  }

  async findTicketByIdAndUser(id: string, userId: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findTicketByIdAndUser(id, userId);
    if (!ticket) {
      throw new NotFoundException(
        `Ticket con ID '${id}' no encontrado o no tienes permisos para verlo.`,
      );
    }
    return ticket;
  }

  async findAllTicketsByProducer(producerId: string, orderId?: string): Promise<Ticket[]> {
    return await this.ticketsRepository.findAllTicketsByProducer(producerId, orderId);
  }

  async findAllTickets(orderId?: string): Promise<Ticket[]> {
    return await this.ticketsRepository.findAllTickets(orderId);
  }

  async createBulkTickets(createTicketsDto: {
    orderId: string;
    ticketTypeId: string;
    quantity: number;
  }): Promise<Ticket[]> {
    const ticketsToCreate: Partial<Ticket>[] = [];

    for (let i = 1; i <= createTicketsDto.quantity; i++) {
      // ✅ QR firmado con JWT — no puede ser falsificado sin el JWT_SECRET
      const qrCode = this.jwtService.sign({
        orderId: createTicketsDto.orderId,
        ticketTypeId: createTicketsDto.ticketTypeId,
        index: i,
      });

      ticketsToCreate.push({
        qrCode,
        orderId: createTicketsDto.orderId,
        ticketTypeId: createTicketsDto.ticketTypeId,
      });
    }

    return await this.ticketsRepository.createBulkTickets(
      ticketsToCreate,
      createTicketsDto.ticketTypeId,
    );
  }

  async countActiveTicketsByUser(userId: string): Promise<number> {
    return await this.ticketsRepository.countActiveTicketsByUser(userId);
  }

  async scanTicket(qrCode: string): Promise<{ message: string; ticket: Ticket }> {
    // ✅ Verificar firma JWT antes de tocar la BD
    try {
      this.jwtService.verify(qrCode);
    } catch {
      throw new UnauthorizedException(
        `QR inválido — firma no verificable, posible falsificación`,
      );
    }

    const ticket = await this.ticketsRepository.findByQrCode(qrCode);

    if (!ticket) {
      throw new NotFoundException(
        `QR no reconocido — ticket no encontrado`,
      );
    }

    if (!ticket.allowEntrance) {
      throw new BadRequestException(
        `Ticket ya utilizado el ${ticket.usedAt?.toLocaleString('es-AR')} — posible uso duplicado`,
      );
    }

    ticket.allowEntrance = false;
    ticket.usedAt = new Date();

    const updated = await this.ticketsRepository.save(ticket);

    return {
      message: 'Acceso permitido — ticket validado correctamente',
      ticket: updated,
    };
  }

  async getEventStats(eventId: string): Promise<{
    total: number;
    arrived: number;
    pending: number;
    percentage: number;
  }> {
    const { total, arrived, pending } =
      await this.ticketsRepository.getEventStats(eventId);

    const percentage =
      total === 0 ? 0 : Math.round((arrived / total) * 1000) / 10;

    return { total, arrived, pending, percentage };
  }
}