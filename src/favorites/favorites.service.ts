import { Injectable, BadRequestException } from '@nestjs/common';
import { FavoritesRepository } from './favorites.repository';
import { EventsService } from '../events/events.service'; // Ajusta la ruta a tu módulo de eventos
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly favoritesRepository: FavoritesRepository,
    private readonly eventsService: EventsService, // Inyección para validar existencia del evento
  ) {}

  async toggleFavorite(
    userId: string,
    eventId: string,
  ): Promise<{ added: boolean; message: string }> {
    await this.eventsService.getEventById(eventId);

    const existingFavorite =
      await this.favoritesRepository.getFavoriteByUserAndEvent(userId, eventId);

    if (existingFavorite) {
      await this.favoritesRepository.deleteFavorite(existingFavorite.id);
      return {
        added: false,
        message: 'Evento eliminado de tus favoritos exitosamente.',
      };
    }

    await this.favoritesRepository.createFavorite(userId, eventId);
    return {
      added: true,
      message: 'Evento agregado a tus favoritos exitosamente.',
    };
  }

  async getFavoritesByUserId(userId: string): Promise<Favorite[]> {
    return await this.favoritesRepository.getFavoritesByUserId(userId);
  }
}
