import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesRepository {
  constructor(
    @InjectRepository(Favorite)
    private readonly ormFavoritesRepository: Repository<Favorite>,
  ) {}

  async createFavorite(userId: string, eventId: string): Promise<Favorite> {
    const newFavorite = this.ormFavoritesRepository.create({ userId, eventId });
    return await this.ormFavoritesRepository.save(newFavorite);
  }

  async getFavoriteByUserAndEvent(
    userId: string,
    eventId: string,
  ): Promise<Favorite | null> {
    return await this.ormFavoritesRepository.findOne({
      where: { userId, eventId },
    });
  }

  async getFavoritesByUserId(userId: string): Promise<Favorite[]> {
    return await this.ormFavoritesRepository.find({
      where: { userId },
      relations: { event: true },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteFavorite(id: string): Promise<void> {
    const result = await this.ormFavoritesRepository.delete(id);

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Favorite record with id ${id} not found`);
    }
  }
}
