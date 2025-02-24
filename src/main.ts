import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ErrorHandlingInterceptor } from './common/interceptors/error-handling.interceptor';
import helmet from 'helmet';
import { logger } from './common/logger/winston-logger';

dotenv.config(); // Load environment variables

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Helmet for security
  app.use(helmet());

  // Enable CORS with custom configuration
  app.enableCors({
    origin: ['http://localhost:3000'], // Replace with actual frontend domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // Enables credentials (cookies, authorization headers)
  });

  // Enable global validation pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Air Quality API')
    .setDescription('API documentation for the air quality data service')
    .setVersion('1.0')
    .addBearerAuth() // Adds JWT authentication support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Accessible at http://localhost:8000/api/docs
  app.useGlobalInterceptors(new ErrorHandlingInterceptor());

  app.useLogger(logger);
  await app.listen(process.env.PORT || 8000);
}

bootstrap();
