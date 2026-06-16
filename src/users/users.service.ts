import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/updateUser.dto';
import { user } from '@getbrevo/brevo/dist/cjs/api';

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
    user.profileImageUrl = imgUrl;
    return this.usersRepo.save(user);
  }

  async upsertProfile(id: string, userData: UpdateUserDto): Promise<User> {
    let user = await this.usersRepo.findOne({ where: { id } });

    if (!user) {
      user = this.usersRepo.create({ id });
    }

    Object.assign(user, userData);

    return this.usersRepo.save(user);
  }

  async updateUserInfo(userId: string, userData: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(userId);
    if (!user) throw new NotFoundException(`User id= ${userId} not found`);
    Object.assign(user, userData);
    return await this.usersRepo.save(user);
  }

  async getUsersToNotify(): Promise<User[]> {
    const users = await this.usersRepo.find({
      where: { allowNewsletter: true, deletedAt: IsNull() },
    });
    console.log('users to notify coount = ' + users.length);
    return users;
  }
}
