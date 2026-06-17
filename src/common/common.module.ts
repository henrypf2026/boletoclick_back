import { Module } from '@nestjs/common';
import { ErrorTranslatorService } from './services/error-translator.service';

@Module({
  providers: [ErrorTranslatorService],
  exports: [ErrorTranslatorService],
})
export class CommonModule {}
