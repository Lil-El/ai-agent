import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /**
   * 配置全局验证管道，用于自动校验请求数据：
      whitelist: true：自动移除 DTO（数据传输对象）中未定义的属性
      transform: true：自动将请求参数转换为对应的 DTO 类实例（如字符串转数字）
      forbidNonWhitelisted: true：如果请求包含未在 DTO 中定义的属性，直接抛出错误
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();