import {
  Controller,
  Get,
  Param,
  NotFoundException,
  ForbiddenException,
  UseGuards,
  UseInterceptors,
  Patch,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
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
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios registrados' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAllUsers();
  }
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
    status: 403,
    description: 'No tenés permiso para modificar esta cuenta.',
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
    @CurrentUser() user,
  ) {
    // Ownership check: sólo podés editar tu propio perfil
    if (user.id !== id) {
      throw new ForbiddenException(
        'No tenés permiso para modificar esta cuenta',
      );
    }

    return this.usersService.updateUserInfo(id, newUserData);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un usuario (soft delete)',
    description:
      'El propio usuario puede eliminar su cuenta, o un administrador puede eliminar cualquier cuenta.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'No tenés permiso para eliminar esta cuenta.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER, Role.PRODUCER, Role.SCANNER)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser,
  ): Promise<{ message: string }> {
    const isAdmin = currentUser.role === Role.ADMIN;
    const isOwner = currentUser.id === id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'No tenés permiso para eliminar esta cuenta',
      );
    }

    return this.usersService.deleteUser(id);
  }
}
