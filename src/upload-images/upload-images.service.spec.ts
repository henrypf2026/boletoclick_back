import { Test, TestingModule } from '@nestjs/testing';
import { UploadImagesService } from './upload-images.service';

describe('UploadImagesService', () => {
  let service: UploadImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadImagesService],
    }).compile();

    service = module.get<UploadImagesService>(UploadImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
