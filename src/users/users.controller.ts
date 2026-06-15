import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  UseInterceptors,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersInterceptor } from '../interceptors/user.interceptor';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Obtener el perfil del usuario autenticado actualmente',
  })
  @ApiResponse({ status: 200, description: 'Perfil obtenido con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado (Unauthorized).' })
  async getMe(@CurrentUser() user): Promise<User> {
    const userProfile = await this.usersService.findUserById(user.id);

    if (!userProfile) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }

    return userProfile;
  }

  @ApiBearerAuth()
  @Get(':id')
  @UseInterceptors(UsersInterceptor)
  @ApiOperation({ summary: 'Obtener el perfil de un usuario por su ID' })
  async findUserById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findUserById(id);

    if (!user) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }

    return user;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualiza la información del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario actualizada con éxito.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Error al actualizar. Se intentó modificar un parámetro inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  @UseInterceptors(UsersInterceptor)
  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() newUserData: UpdateUserDto,
  ) {
    return this.usersService.updateUserInfo(id, newUserData);
  }

  // @Delete(':id')
  // @UseGuards(SupabaseAuthGuard, RolesGuard)
  // @Roles(Role.USER)
  // @ApiResponse({
  //   status: 200,
  //   description: 'Usuario desactivado',
  // })
  // @ApiParam({
  //   name: 'id',
  //   description: 'Identificador único del venue (UUID v4)',
  //   required: true,
  // })
  // removeVenue(@Param('id') id: string): Promise<void> {
  //   return this.usersService.removeUser(id);
  // }
}
