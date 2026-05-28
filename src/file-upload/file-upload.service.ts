import { Injectable, NotFoundException } from '@nestjs/common';
import { FileUploadRepository } from './file-upload.repository';

@Injectable()
export class FileUploadService {
  constructor(private readonly fileUploadRepository: FileUploadRepository) {}

  async uploadImage(file: Express.Multer.File) {
    const result = await this.fileUploadRepository.uploadImage(file);
    if (!result.secure_url)
      throw new NotFoundException(`Falla al cargar imagen`);

    return result.secure_url;
  }
}
