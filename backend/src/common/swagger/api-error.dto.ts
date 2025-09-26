import { ApiProperty } from '@nestjs/swagger'

export class ApiError {
    @ApiProperty({ example: 400 }) statusCode: number
    @ApiProperty({ example: 'Bad Request' }) error: string
    @ApiProperty({ example: 'Validation failed' }) message: string
    @ApiProperty({ example: 'P2002', required: false }) code?: string
}
