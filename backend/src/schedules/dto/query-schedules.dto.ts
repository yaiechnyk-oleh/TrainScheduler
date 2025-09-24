import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsISO8601, IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator'
import { TrainType } from '@prisma/client'

export class QuerySchedulesDto {
    @ApiPropertyOptional({ example: '2025-09-24' })
    @IsISO8601() date: string

    @ApiPropertyOptional()
    @IsOptional() @IsString() routeId?: string

    @ApiPropertyOptional({ enum: TrainType })
    @IsOptional() @IsEnum(TrainType) trainType?: TrainType

    @ApiPropertyOptional({ example: 1 })
    @IsOptional() @IsInt() @Min(1) page?: number

    @ApiPropertyOptional({ example: 20 })
    @IsOptional() @IsInt() @Min(1) pageSize?: number
}
