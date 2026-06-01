import {
  BadRequestException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findUserById(id: string): Promise<User | null> {
    return await this.usersRepository.findUserById(id);
  }

  async createUserProfile(
    id: string,
    profileData: Partial<User>,
  ): Promise<User> {
    // const today = new Date();
    // const birth = new Date(profileData.birthDate!);
    // let age = today.getFullYear() - birth.getFullYear();
    // if (age < 18) {
    //   throw new BadRequestException('User must be at least 18 years old');
    // }

    return await this.usersRepository.createUserProfile(id, profileData);
  }

  updateUserImage(userId: string, imgUrl: string): Promise<User> {
    return this.usersRepository.updateUserImgUrl(userId, imgUrl);
  }
}
