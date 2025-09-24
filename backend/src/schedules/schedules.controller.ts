import { Controller, Get, Query, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { SchedulesService } from './schedules.service'
import { QuerySchedulesDto } from './dto/query-schedules.dto'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger'
import { PaginatedSchedules } from './dto/schedule-view.dto'
import { ApiError } from '../common/swagger/api-error.dto'
import { TrainType } from '@prisma/client'

@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
    constructor(private svc: SchedulesService) {}

    @Get()
    @ApiQuery({ name: 'date', required: true, example: '2025-09-24' })
    @ApiQuery({ name: 'routeId', required: false })
    @ApiQuery({ name: 'trainType', required: false, enum: TrainType })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, example: 20 })
    @ApiOkResponse({
        description: 'Paginated schedules',
        type: PaginatedSchedules,
        schema: {
            example: {
                items: [{
                    id: 'sch_1',
                    routeId: 'r_1',
                    trainType: 'INTERCITY',
                    departAt: '2025-09-24T08:00:00.000Z',
                    arriveAt: '2025-09-24T13:10:00.000Z',
                    status: 'ON_TIME',
                    delayMinutes: 0,
                    route: {
                        id: 'r_1', name: 'Kyiv → Lviv (fast line)', code: 'IC-721',
                        stops: [
                            { order: 1, stop: { id: 's_kyiv', name: 'Kyiv-Pasazhyrskyi', city: 'Kyiv' } },
                            { order: 2, stop: { id: 's_fastiv', name: 'Fastiv', city: 'Kyiv Oblast' } },
                            { order: 3, stop: { id: 's_lviv', name: 'Lviv', city: 'Lviv' } },
                        ]
                    }
                }],
                total: 1, page: 1, pageSize: 20
            }
        }
    })
    @ApiBadRequestResponse({ type: ApiError })
    list(@Query() q: QuerySchedulesDto) {
        return this.svc.list(q.date, q.routeId, q.trainType, q.page, q.pageSize)
    }

    @Post()
    @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
    @ApiCreatedResponse({
        description: 'Schedule created',
        schema: {
            example: {
                id: 'sch_new',
                routeId: 'r_1',
                trainType: 'INTERCITY',
                departAt: '2025-09-24T09:00:00.000Z',
                arriveAt: '2025-09-24T12:00:00.000Z',
                status: 'ON_TIME',
                delayMinutes: 0
            }
        }
    })
    create(@Body() dto: CreateScheduleDto) { return this.svc.create(dto) }

    @Patch(':id')
    @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
    @ApiOkResponse({ description: 'Schedule updated', schema: { example: { id: 'sch_new', status: 'DELAYED', delayMinutes: 10 } } })
    update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) { return this.svc.update(id, dto) }

    @Delete(':id')
    @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
    @ApiOkResponse({ description: 'Schedule deleted', schema: { example: { id: 'sch_new' } } })
    remove(@Param('id') id: string) { return this.svc.remove(id) }
}
