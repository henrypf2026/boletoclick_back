import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { CloudinaryConfig } from '../config/cloudinary';
import { FileUploadRepository } from './file-upload.repository';
import { UsersModule } from '../users/users.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [UsersModule, SupabaseModule],
  controllers: [FileUploadController],
  providers: [FileUploadService, CloudinaryConfig, FileUploadRepository],
  exports: [FileUploadService],
})
export class FileUploadModule {}