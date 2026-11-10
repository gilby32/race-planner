import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();

  const port = app.get(ConfigService).get<number>('PORT', 4000);
  // 0.0.0.0 so the phone can connect from the local network
  await app.listen(port, '0.0.0.0');
  Logger.log(`GraphQL ready at http://localhost:${port}/graphql`, 'Bootstrap');
}

void bootstrap();
