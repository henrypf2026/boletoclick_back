import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // ─── Buscar por ID ────────────────────────────────────────────

  async findUserById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  // ─── Actualizar avatar (Cloudinary URL) ───────────────────────

  async updateUserImage(userId: string, imgUrl: string): Promise<User> {
    const user = await this.findUserById(userId);
    user.avatarUrl = imgUrl;
    return this.usersRepo.save(user);
  }

  // ─── Upsert parcial ───────────────────────────────────────────
  /**
   * Si el usuario existe lo actualiza.
   * Si no existe (registro vía OAuth incompleto) lo crea.
   * Solo sobreescribe los campos que vienen en el DTO;
   * los undefined no tocan valores previos.
   */
  async upsertProfile(
    supabaseId: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    let user = await this.usersRepo.findOne({ where: { supabaseId } });

    if (!user) {
      user = this.usersRepo.create({ supabaseId });
    }

    if (dto.name      !== undefined) user.name      = dto.name;
    if (dto.birthDate !== undefined) user.birthDate  = dto.birthDate;
    if (dto.avatarUrl !== undefined) user.avatarUrl  = dto.avatarUrl;
    if (dto.bankInfo  !== undefined) user.bankInfo   = dto.bankInfo;

    return this.usersRepo.save(user);
  }

  // ─── Validación de perfil completo (usado por el Guard) ───────
  /**
   * Retorna la lista de campos faltantes según el rol.
   * Array vacío = perfil completo = guard deja pasar.
   */
  getMissingFields(user: User, role: 'user' | 'producer'): string[] {
    const missing: string[] = [];

    if (!user.name)      missing.push('name');
    if (!user.birthDate) missing.push('birthDate');

    if (role === 'producer') {
      if (!user.bankInfo?.accountHolder) missing.push('bankInfo.accountHolder');
      if (!user.bankInfo?.accountNumber) missing.push('bankInfo.accountNumber');
      if (!user.bankInfo?.bankName)      missing.push('bankInfo.bankName');
    }

    return missing;
  }
}