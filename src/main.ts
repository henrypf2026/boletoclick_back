import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('BoletoClick')
    .setDescription('Aplicación backend de BoletoClick (Henry PF cohorte PT31)')
    .setVersion('1.0')
    .addTag('')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  console.log(`Server listening on port ${PORT}`);
}
bootstrap();
