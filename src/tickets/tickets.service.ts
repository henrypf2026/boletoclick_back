import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TicketsRepository } from './tickets.repository';
import { Ticket } from './entities/ticket.entity';
import { ScanTicketDto } from './dto/scan-ticket.dto';
import { Role } from '../common/enums/role.enum';

const TICKET_URL_UUID_PATTERN =
  /\/entradas\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

const JWT_PATTERN =
  /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/;

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
    const ticket = await this.ticketsRepository.findTicketByIdAndUser(
      id,
      userId,
    );
    if (!ticket) {
      throw new NotFoundException(
        `Ticket con ID '${id}' no encontrado o no tienes permisos para verlo.`,
      );
    }
    return ticket;
  }

  async findAllTicketsByProducer(
    producerId: string,
    orderId?: string,
  ): Promise<Ticket[]> {
    return await this.ticketsRepository.findAllTicketsByProducer(
      producerId,
      orderId,
    );
  }

  async findAllTickets(orderId?: string): Promise<Ticket[]> {
    return await this.ticketsRepository.findAllTickets(orderId);
  }

  async createBulkTickets(createTicketsDto: {
    orderId: string;
    ticketTypeId: string;
    quantity: string;
  }): Promise<Ticket[]> {
    const ticketsToCreate: Partial<Ticket>[] = [];
    const quantityNumber = Number(createTicketsDto.quantity);

    for (let i = 1; i <= quantityNumber; i++) {
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

  async scanTicket(
    dto: ScanTicketDto,
    user?: { id: string; role: Role },
  ): Promise<{ message: string; ticket: Ticket }> {
    const ticket = await this.resolveTicketFromScan(dto);

    if (!ticket) {
      throw new NotFoundException('QR no reconocido — ticket no encontrado');
    }

    const ticketEventId = ticket.ticketType?.eventId;

    if (dto.eventId && ticketEventId && ticketEventId !== dto.eventId) {
      throw new BadRequestException(
        'Este ticket no pertenece al evento seleccionado.',
      );
    }

    if (user?.role === Role.PRODUCER) {
      const producerId = ticket.ticketType?.event?.producerId;
      if (!producerId || producerId !== user.id) {
        throw new ForbiddenException(
          'No tenés permiso para escanear boletos de este evento.',
        );
      }
    }

    if (!ticket.allowEntrance) {
      const usedAt = ticket.usedAt?.toLocaleString('es-AR');
      throw new BadRequestException(
        usedAt
          ? `Este boleto ya fue escaneado el ${usedAt}. No se puede repetir la lectura.`
          : 'Este boleto ya fue escaneado. No se puede repetir la lectura.',
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

  private async resolveTicketFromScan(
    dto: ScanTicketDto,
  ): Promise<Ticket | null> {
    if (dto.ticketId) {
      return this.ticketsRepository.findByIdForScan(dto.ticketId);
    }

    const raw = dto.qrCode?.trim();
    if (!raw) {
      throw new BadRequestException(
        'Debés enviar qrCode o ticketId para escanear.',
      );
    }

    const ticketIdFromUrl = raw.match(TICKET_URL_UUID_PATTERN)?.[1];
    if (ticketIdFromUrl) {
      return this.ticketsRepository.findByIdForScan(ticketIdFromUrl);
    }

    const jwtMatch = raw.match(JWT_PATTERN);
    const jwt = jwtMatch?.[0] ?? raw;

    try {
      this.jwtService.verify(jwt);
    } catch {
      throw new UnauthorizedException(
        'QR inválido — firma no verificable, posible falsificación',
      );
    }

    return this.ticketsRepository.findByQrCode(jwt);
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
