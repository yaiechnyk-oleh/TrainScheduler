import { LoggingInterceptor } from './logging.interceptor'
import { of, lastValueFrom } from 'rxjs'

describe('LoggingInterceptor', () => {
    it('calls next and does not alter the response', async () => {
        const interceptor = new LoggingInterceptor()
        const ctx: any = { switchToHttp: () => ({ getRequest: () => ({ method: 'GET', url: '/x' }) }) }
        const next: any = { handle: () => of('ok') } // <-- return an Observable

        const result = await lastValueFrom(interceptor.intercept(ctx as any, next))
        expect(result).toBe('ok')
    })
})
