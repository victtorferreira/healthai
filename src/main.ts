import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Prefixo global da API
  app.setGlobalPrefix('api/v1');

  // Validação automática de DTOs com class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // remove campos não declarados no DTO
      forbidNonWhitelisted: true,
      transform: true,        // converte tipos automaticamente
    }),
  );

  // CORS — ajuste as origens em produção
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  // Swagger — documentação automática da API
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('HealthAI API')
      .setDescription('Plataforma de triagem e acompanhamento de saúde com IA')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger disponível em http://localhost:3000/api/docs');
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`HealthAI rodando na porta ${port}`);
}

bootstrap();
