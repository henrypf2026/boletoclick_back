import { PartialType } from '@nestjs/mapped-types';
import { CreateUploadImageDto } from './create-upload-image.dto';

export class UpdateUploadImageDto extends PartialType(CreateUploadImageDto) {}
