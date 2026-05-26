import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UploadImagesService } from './upload-images.service';
import { CreateUploadImageDto } from './dto/create-upload-image.dto';
import { UpdateUploadImageDto } from './dto/update-upload-image.dto';

@Controller('upload-images')
export class UploadImagesController {
  constructor(private readonly uploadImagesService: UploadImagesService) {}

  @Post()
  create(@Body() createUploadImageDto: CreateUploadImageDto) {
    return this.uploadImagesService.create(createUploadImageDto);
  }

  @Get()
  findAll() {
    return this.uploadImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uploadImagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUploadImageDto: UpdateUploadImageDto) {
    return this.uploadImagesService.update(+id, updateUploadImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploadImagesService.remove(+id);
  }
}
