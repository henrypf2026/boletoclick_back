import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';

  // 👈 CORREGIDO: Respaldo por si el .env tarda en leerse o no encuentra la variable
  const cookieSecret = process.env.COOKIE_SECRET || 'secret';
  app.use(cookieParser(cookieSecret));

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.use('/payments/webhook', (req: any, res: any, next: any) => {
    let data = '';

    req.setEncoding('utf8');

    req.on('data', (chunk: string) => {
      data += chunk;
    });

    req.on('end', () => {
      req.rawBody = Buffer.from(data);
      next();
    });
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger disponible también en producción
  const config = new DocumentBuilder()
    .setTitle('BoletoClick API')
    .setDescription('API de la plataforma de tickets')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  console.log(`📄 Swagger disponible en /api`);

  const PORT = process.env.PORT ?? 3001;

  await app.listen(PORT);

  console.log(`🚀 Server listening on port ${PORT}`);
}

bootstrap();
