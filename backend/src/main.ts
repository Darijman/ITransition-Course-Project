import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
// import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cors from 'cors';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        console.log('Validation errors:', errors);
        return new BadRequestException({ error: 'Something went wrong...' });
      },
    }),
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );

  // app.useWebSocketAdapter(new IoAdapter(app));
  app.use(express.static('public'));
  app.use(express.json());
  app.use(cookieParser());
  await app.listen(9000, '0.0.0.0');
}
bootstrap();
