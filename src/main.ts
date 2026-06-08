import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('BoletoClick')
    .setDescription('Aplicación backend de BoletoClick (Henry PF cohorte PT31)')
    .setVersion('1.0')
    .addTag('')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

<<<<<<< HEAD
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const PORT = process.env.PORT ?? 3001;
=======
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const PORT = process.env.PORT ?? 3000;
>>>>>>> 364f42c841cd9d23efcc6ec8b280939fbeff26cf
  await app.listen(PORT);
  console.log(`Server listening on port ${PORT}`);
}
bootstrap();
