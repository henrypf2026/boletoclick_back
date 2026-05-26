import { Module } from '@nestjs/common';
import { UploadImagesService } from './upload-images.service';
import { UploadImagesController } from './upload-images.controller';

@Module({
  controllers: [UploadImagesController],
  providers: [UploadImagesService],
})
export class UploadImagesModule {}
