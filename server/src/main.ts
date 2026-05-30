import * as dns from 'dns';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

// В сетях с урезанным DNS (некоторые Docker/CI/песочницы) системный резолвер
// может отклонять запросы Node. Опционально форсим публичный DNS через env:
// DNS_SERVERS=8.8.8.8,1.1.1.1
if (process.env.DNS_SERVERS) {
   dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
}

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   const config = app.get(ConfigService);

   // Контроллеры доступны под /api, статика (audio/image) остаётся в корне
   app.setGlobalPrefix('api');

   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         transform: true,
         transformOptions: { enableImplicitConversion: true },
      })
   );

   app.enableCors({
      origin: config.get<string>('CLIENT_URL') ?? true,
      credentials: true,
   });

   const swaggerConfig = new DocumentBuilder()
      .setTitle('Music Platform API')
      .setDescription('YouTube Music–style backend')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
   const document = SwaggerModule.createDocument(app, swaggerConfig);
   SwaggerModule.setup('api/docs', app, document);

   const port = config.get<number>('PORT') ?? 5000;
   await app.listen(port);
   console.log(`server started on PORT ${port} — docs: http://localhost:${port}/api/docs`);
}

void bootstrap();
