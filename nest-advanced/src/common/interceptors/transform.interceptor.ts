import {
  NestInterceptor,
  CallHandler,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const request = context
      .switchToHttp()
      .getRequest<{ method: string; url: string }>();

    const { method, url } = request;
    const startTime = Date.now();
    const requestTime = new Date().toISOString();

    console.log(`[请求] [${requestTime}] ${method} ${url}`);

    /**
     * map: 对数据流中的每个值进行转换，返回新的值。
     * tap: 在不改变数据流的情况下，执行副作用操作（如日志记录、调试）。
     */
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        data,
        message: '请求成功',
      })),
      tap(() => {
        const duration = Date.now() - startTime;
        console.log(`[响应] [${requestTime}] ${method} ${url} ${duration}ms`);
      }),
    );
  }
}
