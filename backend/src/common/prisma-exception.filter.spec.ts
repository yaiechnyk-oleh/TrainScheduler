import { PrismaExceptionFilter } from './prisma-exception.filter'
import { HttpStatus } from '@nestjs/common'

function mockHost() {
    const statusFn = jest.fn().mockReturnThis()
    const jsonFn = jest.fn().mockReturnThis()
    const getResponse = () => ({ status: statusFn, json: jsonFn })
    return {
        host: {
            switchToHttp: () => ({ getResponse }),
        } as any,
        statusFn, jsonFn,
    }
}

describe('PrismaExceptionFilter', () => {
    it('maps P2002 (unique) to 409', () => {
        const { host, statusFn, jsonFn } = mockHost()
        const filter = new PrismaExceptionFilter()
        const ex: any = { code: 'P2002', message: 'Unique constraint violation' }

        filter.catch(ex, host)

        expect(statusFn).toHaveBeenCalledWith(HttpStatus.CONFLICT)
        expect(jsonFn).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: HttpStatus.CONFLICT,
                error: 'PrismaError',
                code: 'P2002',
            }),
        )
    })

    it('maps P2025 (not found) to 404', () => {
        const { host, statusFn, jsonFn } = mockHost()
        const filter = new PrismaExceptionFilter()
        const ex: any = { code: 'P2025', message: 'Record not found' }

        filter.catch(ex, host)

        expect(statusFn).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
        expect(jsonFn).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: HttpStatus.NOT_FOUND,
                error: 'PrismaError',
                code: 'P2025',
            }),
        )
    })

    it('defaults others to 400', () => {
        const { host, statusFn, jsonFn } = mockHost()
        const filter = new PrismaExceptionFilter()
        const ex: any = { code: 'P9999', message: 'Some error' }

        filter.catch(ex, host)

        expect(statusFn).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
        expect(jsonFn).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'PrismaError',
                code: 'P9999',
            }),
        )
    })
})
