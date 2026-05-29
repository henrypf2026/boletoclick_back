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
    if (!userId) throw new NotFoundException('UserId no existe');
    const result = await this.fileUploadRepository.uploadImage(file);
    if (!result.secure_url)
      throw new NotFoundException(`Falla al cargar imagen`);
    this.usersService.updateUserImage(userId, result.secure_url);
    return result.secure_url;
  }
}
