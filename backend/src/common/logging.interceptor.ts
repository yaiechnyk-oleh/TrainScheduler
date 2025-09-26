import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP')
    intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
        const req = ctx.switchToHttp().getRequest()
        const { method, url } = req
        const started = Date.now()
        return next.handle().pipe(
            tap(() => this.logger.log(`${method} ${url} ${Date.now() - started}ms`)),
        )
    }
}
