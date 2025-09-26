import {Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards} from '@nestjs/common'
import { RoutesService } from './routes.service'
import { CreateRouteDto } from './dto/create-route.dto'
import { UpdateRouteDto } from './dto/update-route.dto'
import { SetStopsDto } from './dto/set-stops.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse, ApiNotFoundResponse,
    ApiOkResponse,
    ApiParam,
    ApiTags
} from '@nestjs/swagger'
import { ApiError } from '../common/swagger/api-error.dto'
import {GetRouteQueryDto} from "./dto/get-route.query";

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
    constructor(private svc: RoutesService) {}

    @Get()
    @ApiOkResponse({
        description: 'List of routes (with ordered stops)',
        schema: {
            example: [{
                id: 'r_1', name: 'Kyiv → Lviv (fast line)', code: 'IC-721',
                stops: [
                    { order: 1, stop: { id: 's_kyiv', name: 'Kyiv-Pasazhyrskyi', city: 'Kyiv' } },
                    { order: 2, stop: { id: 's_fastiv', name: 'Fastiv', city: 'Kyiv Oblast' } },
                    { order: 3, stop: { id: 's_lviv', name: 'Lviv', city: 'Lviv' } },
                ]
            }]
        }
    })
    list() { return this.svc.list() }

    @Get(':id')
    @ApiParam({ name: 'id', example: 'cku8x1abc0001s8fh2nq0xyz1' })
    @ApiOkResponse({
        description: 'Route with ordered stops (and schedules if date is provided)',
        schema: {
            example: {
                id: 'cku8x1abc0001s8fh2nq0xyz1',
                code: 'R-12',
                name: 'Dnipro → Kharkiv',
                stops: [
                    { order: 1, stopId: 's1', stop: { id: 's1', name: 'Dnipro' } },
                    { order: 2, stopId: 's2', stop: { id: 's2', name: 'Kharkiv' } }
                ],
                schedules: [
                    { id: 'sch1', departAt: '2025-09-25T06:00:00.000Z', arriveAt: '2025-09-25T09:10:00.000Z', trainType: 'INTERCITY' }
                ]
            }
        }
    })
    @ApiNotFoundResponse({ type: ApiError })
    getOne(@Param('id') id: string, @Query() q: GetRouteQueryDto) {
        return this.svc.findOne(id, q.date)
    }

    @Post()
    @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
    @ApiCreatedResponse({ description: 'Route created', schema: { example: { id: 'r_new', name: 'Dnipro → Kharkiv', code: 'R-12' } } })
    @ApiBadRequestResponse({ type: ApiError })
    create(@Body() dto: CreateRouteDto) { return this.svc.create(dto) }

    @Patch(':id')
    @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
    @ApiOkResponse({ description: 'Route updated', schema: { example: { id: 'r_new', name: 'Dnipro → Kharkiv (express)' } } })
    update(@Param('id') id: string, @Body() dto: UpdateRouteDto) { return this.svc.update(id, dto) }

    @Delete(':id')
    @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
    @ApiOkResponse({ description: 'Route deleted', schema: { example: { id: 'r_new' } } })
    remove(@Param('id') id: string) { return this.svc.remove(id) }

    @Post(':id/stops')
    @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
    @ApiOkResponse({
        description: 'Updated route with ordered stops',
        schema: {
            example: {
                id: 'r_1', name: 'Kyiv → Lviv (fast line)', code: 'IC-721',
                stops: [
                    { order: 1, stop: { id: 's_kyiv', name: 'Kyiv-Pasazhyrskyi', city: 'Kyiv' } },
                    { order: 2, stop: { id: 's_fastiv', name: 'Fastiv', city: 'Kyiv Oblast' } },
                    { order: 3, stop: { id: 's_lviv', name: 'Lviv', city: 'Lviv' } },
                ]
            }
        }
    })
    setStops(@Param('id') id: string, @Body() dto: SetStopsDto) { return this.svc.setStops(id, dto) }
}
