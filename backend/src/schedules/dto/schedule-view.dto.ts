import { ApiProperty } from '@nestjs/swagger'
import { TrainType, ScheduleStatus } from '@prisma/client'

export class StopView {
    @ApiProperty() id: string
    @ApiProperty() name: string
    @ApiProperty({ required: false }) city?: string
}
export class RouteStopView {
    @ApiProperty() order: number
    @ApiProperty({ type: StopView }) stop: StopView
}
export class RouteView {
    @ApiProperty() id: string
    @ApiProperty() name: string
    @ApiProperty({ required: false }) code?: string
    @ApiProperty({ type: [RouteStopView] }) stops: RouteStopView[]
}
export class ScheduleView {
    @ApiProperty() id: string
    @ApiProperty() routeId: string
    @ApiProperty({ enum: TrainType }) trainType: TrainType
    @ApiProperty() departAt: string
    @ApiProperty() arriveAt: string
    @ApiProperty({ enum: ScheduleStatus }) status: ScheduleStatus
    @ApiProperty() delayMinutes: number
    @ApiProperty({ type: RouteView }) route: RouteView
}
export class PaginatedSchedules {
    @ApiProperty({ type: [ScheduleView] }) items: ScheduleView[]
    @ApiProperty({ example: 42 }) total: number
    @ApiProperty({ example: 1 }) page: number
    @ApiProperty({ example: 20 }) pageSize: number
}
