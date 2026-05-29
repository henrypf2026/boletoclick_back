import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly ormUserRepository: Repository<User>,
  ) {}

  async findUserById(id: string): Promise<User | null> {
    return await this.ormUserRepository.findOne({
      where: { id },
    });
  }

  async createUserProfile(
    id: string,
    profileData: Partial<User>,
  ): Promise<User> {
    const newUser = this.ormUserRepository.create({
      id,
      email: profileData.email,
      name: profileData.name,
      birthDate: profileData.birthDate,
      documentNumber: profileData.documentNumber,
      profileImageUrl: profileData.profileImageUrl,
      allowNewsletter: profileData.allowNewsletter,
      businessName: profileData.businessName,
      role: profileData.role || Role.USER, // 💡 Si no viene rol, por defecto es USER
    });

    return await this.ormUserRepository.save(newUser);
  }
}
