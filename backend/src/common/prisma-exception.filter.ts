import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Prisma } from '@prisma/client'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const res = host.switchToHttp().getResponse()
        let status = HttpStatus.BAD_REQUEST
        let message = exception.message

        if (exception.code === 'P2002') { status = HttpStatus.CONFLICT; message = 'Unique constraint violation' }
        if (exception.code === 'P2025') { status = HttpStatus.NOT_FOUND; message = 'Record not found' }

        res.status(status).json({ statusCode: status, error: 'PrismaError', message, code: exception.code })
    }
}
