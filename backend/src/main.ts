import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { LoggingInterceptor } from './common/logging.interceptor'
import { PrismaExceptionFilter } from './common/prisma-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const allow = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:19006,http://127.0.0.1:19006').split(',').map(s => s.trim())
  app.enableCors({ origin: allow, credentials: true })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true }, }))
  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalFilters(new PrismaExceptionFilter())

  const config = new DocumentBuilder()
      .setTitle('Train API')
      .setDescription('Schedules, routes, stops, favorites')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
  const doc = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, doc)

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
