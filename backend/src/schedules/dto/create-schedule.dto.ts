import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601, IsEnum, IsInt, IsOptional, Min, Validate, IsString } from 'class-validator'
import { TrainType, ScheduleStatus } from '@prisma/client'
import { TimesOrder } from '../../common/validators/times-order.validator'

export class CreateScheduleDto {
    @ApiProperty({ example: 'uuid-route-1' })
    @IsString()
    routeId: string

    @ApiProperty({ enum: TrainType, example: 'INTERCITY' })
    @IsEnum(TrainType) trainType: TrainType

    @ApiProperty({ example: '2025-09-24T08:00:00.000Z' })
    @IsISO8601() departAt: string

    @ApiProperty({ example: '2025-09-24T13:10:00.000Z' })
    @IsISO8601() @Validate(TimesOrder) arriveAt: string

    @ApiProperty({ enum: ScheduleStatus, required: false, example: 'ON_TIME' })
    @IsOptional() @IsEnum(ScheduleStatus) status?: ScheduleStatus

    @ApiProperty({ required: false, example: 0 })
    @IsOptional() @IsInt() @Min(0) delayMinutes?: number
}
