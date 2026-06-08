import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { Favorite } from './entities/favorite.entity';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/user-payload.interface';

@ApiTags('Favorites (Eventos Favoritos)')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':eventId/toggle')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOperation({
    summary: 'Agregar o eliminar un evento de tus favoritos (Toggle)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Acción ejecutada con éxito. Devuelve true si se agregó o false si se eliminó.',
    schema: {
      type: 'object',
      properties: {
        added: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Evento agregado a tus favoritos exitosamente.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado (Falta o token inválido).',
  })
  @ApiResponse({
    status: 404,
    description: 'El evento que intentas marcar no existe.',
  })
  async toggleFavorite(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<{ added: boolean; message: string }> {
    return await this.favoritesService.toggleFavorite(user.id, eventId);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOperation({
    summary: 'Obtener el listado de todos tus eventos favoritos',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de favoritos recuperada con éxito junto con la información de los conciertos.',
    type: [Favorite],
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getFavoritesByUserId(
    @CurrentUser() user: UserPayload,
  ): Promise<Favorite[]> {
    return await this.favoritesService.getFavoritesByUserId(user.id);
  }
}
