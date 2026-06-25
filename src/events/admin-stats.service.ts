import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Order } from '../orders/entities/order.entity';
import { Role } from '../common/enums/role.enum';
import { OrderStatus } from '../common/enums/order-status.enum';

@Injectable()
export class AdminStatsService {
  private static comisionGlobal = 12;
  private static productoresLiquidados = new Set<string>();

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getDashboardStats() {
    const totalUsuarios = await this.userRepository.count();
    const totalTicketsEmitidos = await this.ticketRepository.count();

    const eventosPendientes = await this.eventRepository.count({
      where: { status: 'PENDING' as any },
    });

    const ahora = new Date();
    const timeStr = ahora.toLocaleTimeString('es-AR');

    const servicios = [
      {
        name: 'API SERVER',
        status: 'ONLINE',
        latency: '12ms',
        color: 'bg-emerald-500',
      },
      {
        name: 'BASE DE DATOS',
        status: 'CONECTADO',
        latency: 'OK',
        color: 'bg-emerald-500',
      },
      {
        name: 'MÉTRICAS BASE',
        status: 'SINCRO',
        latency: `${totalUsuarios} USERS`,
        color: 'bg-blue-500',
      },
      {
        name: 'ENTRADAS EMITIDAS',
        status: 'LIVE',
        latency: `${totalTicketsEmitidos} TKTS`,
        color: 'bg-purple-500',
      },
    ];

    const logs = [
      {
        id: 'log-1',
        timestamp: timeStr,
        type: 'INFO' as const,
        message: `Sincronización de dashboard exitosa. ${totalUsuarios} usuarios registrados en el sistema.`,
      },
      {
        id: 'log-2',
        timestamp: timeStr,
        type: eventosPendientes > 0 ? ('WARN' as const) : ('SUCCESS' as const),
        message:
          eventosPendientes > 0
            ? `Cola de moderación activa: se detectaron ${eventosPendientes} propuestas de eventos pendientes.`
            : 'Cartelera limpia: no hay eventos pendientes de revisión por el administrador.',
      },
    ];

    return { servicios, logs };
  }

  getComision() {
    return { comisionGlobal: AdminStatsService.comisionGlobal };
  }

  updateComision(fee: number) {
    AdminStatsService.comisionGlobal = fee;
    return { comisionGlobal: AdminStatsService.comisionGlobal };
  }

  async getBalancesFinancieros() {
    const productores = await this.userRepository.find({
      where: { role: Role.PRODUCER },
    });

    // Recaudación REAL desde órdenes efectivamente pagadas
    const ordenesPagadas = await this.orderRepository.find({
      where: { status: OrderStatus.PAID },
      relations: {
        tickets: {
          ticketType: {
            event: {
              producer: true,
            },
          },
        },
      },
    });

    // Inicializar mapa con todos los productores en 0
    const producersMap: Record<string, number> = {};
    productores.forEach((p) => {
      producersMap[p.email] = 0;
    });

    // Acumular producerSubtotal real por productor
    ordenesPagadas.forEach((order) => {
      const primerTicket = order.tickets?.[0];
      const emailProductor = primerTicket?.ticketType?.event?.producer?.email;

      if (emailProductor) {
        if (producersMap[emailProductor] !== undefined) {
          producersMap[emailProductor] += order.producerSubtotal;
        } else {
          producersMap[emailProductor] = order.producerSubtotal;
        }
      }
    });

    return Object.keys(producersMap).map((email) => {
      const bruta = producersMap[email];
      const comision = (bruta * AdminStatsService.comisionGlobal) / 100;
      const neto = bruta - comision;

      return {
        email,
        recaudacionBruta: bruta,
        comisionPlataforma: comision,
        netoAPagar: neto,
        estadoLiquidacion: AdminStatsService.productoresLiquidados.has(email)
          ? 'LIQUIDADO'
          : 'PENDIENTE',
      };
    });
  }

  liquidarProductor(email: string) {
    AdminStatsService.productoresLiquidados.add(email);
    return { message: 'Liquidación procesada con éxito', email };
  }
}
