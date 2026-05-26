import { Test, TestingModule } from '@nestjs/testing';
import { UploadImagesController } from './upload-images.controller';
import { UploadImagesService } from './upload-images.service';

describe('UploadImagesController', () => {
  let controller: UploadImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadImagesController],
      providers: [UploadImagesService],
    }).compile();

    controller = module.get<UploadImagesController>(UploadImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
