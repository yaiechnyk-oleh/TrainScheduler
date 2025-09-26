import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsISO8601, IsOptional } from 'class-validator'

export class GetRouteQueryDto {
    @ApiPropertyOptional({ example: '2025-09-25' })
    @IsOptional() @IsISO8601()
    date?: string
}
