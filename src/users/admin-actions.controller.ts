import {
  Controller,
  Patch,
  Param,
  Body,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SupabaseService } from '../supabase/supabase.service';
import { Role } from '../common/enums/role.enum';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface SuspensionBody {
  motivo: string;
  tipoSuspension: string;
  suspendidoHasta?: string;
}

interface CrearAdminBody {
  email: string;
  password?: string;
}

@ApiTags('Admin Actions')
@Controller('users')
export class AdminActionsController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly supabaseService: SupabaseService, // Inyectamos el servicio de Supabase
  ) {}

  // 1. Endpoint para Suspender Cuenta (PATCH /users/:id/suspender)
  @ApiOperation({ summary: 'Suspender una cuenta de usuario desde el panel' })
  @Patch(':id/suspender')
  async suspenderUsuario(
    @Param('id') id: string,
    @Body() body: SuspensionBody,
  ) {
    const usuario = await this.userRepository.findOneBy({ id });
    if (!usuario) throw new BadRequestException('Usuario no encontrado');

    usuario.estado = 'SUSPENDIDO';
    usuario.motivoSuspension = body.motivo;
    usuario.tipoSuspension = body.tipoSuspension;
    usuario.suspendidoHasta = body.suspendidoHasta
      ? new Date(body.suspendidoHasta)
      : null;

    return await this.userRepository.save(usuario);
  }

  // 2. Endpoint para Reactivar Cuenta (PATCH /users/:id/reactivar)
  @ApiOperation({
    summary: 'Restaurar acceso a una cuenta de usuario suspendida',
  })
  @Patch(':id/reactivar')
  async reactivarUsuario(@Param('id') id: string) {
    const usuario = await this.userRepository.findOneBy({ id });
    if (!usuario) throw new BadRequestException('Usuario no encontrado');

    usuario.estado = 'ACTIVO';
    usuario.motivoSuspension = null;
    usuario.tipoSuspension = null;
    usuario.suspendidoHasta = null;

    return await this.userRepository.save(usuario);
  }

  // 3. Endpoint para Crear Administrador (POST /users/admin)
  @ApiOperation({
    summary: 'Dar de alta un nuevo administrador en Supabase y BD local',
  })
  @Post('admin')
  async crearAdmin(@Body() body: CrearAdminBody) {
    const { email, password } = body;
    if (!email || !password)
      throw new BadRequestException('Email y password son requeridos');

    const adminClient = this.supabaseService.getAdminClient();

    // A. Crear el usuario de forma directa en Supabase Auth usando la Service Role Key
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: password,
        email_confirm: true, // Evitamos que tenga que confirmar el email por correo
      });

    if (authError) {
      throw new BadRequestException(`Error en Supabase: ${authError.message}`);
    }

    const supabaseUid = authData.user?.id;
    if (!supabaseUid)
      throw new BadRequestException('No se pudo obtener el UID de Supabase');

    // B. Replicar el registro en tu base de datos de PostgreSQL con rol de ADMIN
    const nuevoAdmin = this.userRepository.create({
      id: supabaseUid,
      email: email.toLowerCase().trim(),
      name: 'STAFF INTERNO',
      birthDate: new Date().toISOString().split('T')[0], // Cumple el formato YYYY-MM-DD requerido
      role: Role.ADMIN, // Le otorgamos el rol administrador de tu enum
      estado: 'ACTIVO',
    });

    return await this.userRepository.save(nuevoAdmin);
  }
}
