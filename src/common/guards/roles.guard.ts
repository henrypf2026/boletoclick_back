import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 🔍 DEBUG TEMPORAL - borrar estas líneas cuando se resuelva el problema
    console.log('========================================');
    console.log('🔍 DEBUG - user de Supabase (request.user):', user);
    console.log('🔍 DEBUG - user.id:', user?.id);
    console.log(
      '🔍 DEBUG - requiredRoles esperados por la ruta:',
      requiredRoles,
    );

    if (!user) {
      console.log('🔍 DEBUG - FALLO: request.user es null/undefined');
      throw new ForbiddenException('Login required');
    }

    const userDb = await this.usersService.findUserById(user.id);

    console.log('🔍 DEBUG - userDb encontrado en la tabla users:', userDb);
    console.log(
      '🔍 DEBUG - userDb.role:',
      userDb?.role,
      '| tipo:',
      typeof userDb?.role,
    );

    if (!userDb) {
      console.log('🔍 DEBUG - FALLO: no se encontró fila en users con ese id');
      throw new ForbiddenException('Login required');
    }

    const userRole = userDb.role;

    console.log(
      '🔍 DEBUG - comparando:',
      JSON.stringify(userRole),
      'contra',
      JSON.stringify(requiredRoles),
    );
    console.log(
      '🔍 DEBUG - resultado includes():',
      requiredRoles.includes(userRole),
    );
    console.log('========================================');

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
