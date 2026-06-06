import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatus } from '../common/enums/order-status.enum';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly ormOrderRepository: Repository<Order>,
  ) {}

  async createOrder(order: Partial<Order>): Promise<Order> {
    return await this.ormOrderRepository.save(order);
  }

  //----------------PARA DESPUÉS----------
  //ver si se implementa una función para actualizar orden que pueda hacer el producer o el admin, evaluar si es necesario y en qué casos se daría

  async findOrderById(id: string): Promise<Order | null> {
    return await this.ormOrderRepository.findOne({
      where: { id },
      relations: {
        tickets: {
          ticketType: true,
        },
        // coupon: true,
      },
    });
  }

  async findMyOrders(userId: string): Promise<Order[]> {
    return await this.ormOrderRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        tickets: {
          ticketType: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOrderByIdAndUser(
    id: string,
    userId: string,
  ): Promise<Order | null> {
    return await this.ormOrderRepository.findOne({
      where: {
        id,
        user: { id: userId },
      },
      relations: {
        tickets: {
          ticketType: true,
        },
        // coupon: true,
      },
    });
  }

  async findAllOrders(
    producerId: string,
    status?: OrderStatus,
    userId?: string,
  ): Promise<Order[]> {
    return await this.ormOrderRepository.find({
      where: {
        tickets: {
          ticketType: {
            event: {
              producer: { id: producerId },
            },
          },
        },
        ...(status ? { status } : {}),
        ...(userId ? { user: { id: userId } } : {}),
      },
      relations: {
        user: true,
        // coupon: true,
        tickets: {
          ticketType: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
