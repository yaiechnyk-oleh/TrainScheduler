import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { RoutesService } from './routes.service'
import { CreateRouteDto } from './dto/create-route.dto'
import { UpdateRouteDto } from './dto/update-route.dto'
import { SetStopsDto } from './dto/set-stops.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ApiError } from '../common/swagger/api-error.dto'

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
