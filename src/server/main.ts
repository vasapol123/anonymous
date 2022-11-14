import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger/dist';
import { DocumentBuilder } from '@nestjs/swagger';

import { ServerModule } from './server.module';

async function bootstrap() {
  const app = await NestFactory.create(ServerModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Anonymous')
    .setDescription('The anonymous API description')
    .setVersion('1.0')
    .addTag('anonymous')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
