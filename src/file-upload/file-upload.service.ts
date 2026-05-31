import { Injectable, NotFoundException } from '@nestjs/common';
import { FileUploadRepository } from './file-upload.repository';
import { UsersService } from '../users/users.service';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileUploadRepository: FileUploadRepository,
    private readonly usersService: UsersService,
  ) {}

  async uploadImage(userId: string, file: Express.Multer.File) {
    const foundUser = await this.usersService.findUserById(userId);
    if (!foundUser) throw new NotFoundException('UserId no existe');

    const result = await this.fileUploadRepository.uploadImage(file);
    const imgUrl = result.secure_url;
    if (!imgUrl) throw new NotFoundException(`Falla al cargar imagen`);
    return this.usersService.updateUserImage(userId, imgUrl);
  }
}
