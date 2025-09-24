import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { StopsService } from './stops.service'
import { CreateStopDto } from './dto/create-stop.dto'
import { UpdateStopDto } from './dto/update-stop.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ApiError } from '../common/swagger/api-error.dto'

@ApiTags('stops')
@Controller('stops')
export class StopsController {
    constructor(private svc: StopsService) {}

    @Get()
    @ApiOkResponse({ description: 'List of stops', schema: { example: [{ id: 's_kyiv', name: 'Kyiv-Pasazhyrskyi', city: 'Kyiv' }] } })
    list() { return this.svc.list() }

    @Post()
    @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
    @ApiCreatedResponse({ description: 'Created stop', schema: { example: { id: 's_new', name: 'Dnipro', city: 'Dnipro' } } })
    @ApiBadRequestResponse({ type: ApiError })
    create(@Body() dto: CreateStopDto) { return this.svc.create(dto) }

    @Patch(':id')
    @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
    @ApiOkResponse({ description: 'Updated stop', schema: { example: { id: 's_new', name: 'Dnipro Main', city: 'Dnipro' } } })
    update(@Param('id') id: string, @Body() dto: UpdateStopDto) { return this.svc.update(id, dto) }

    @Delete(':id')
    @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
    @ApiOkResponse({ description: 'Deleted stop', schema: { example: { id: 's_new' } } })
    remove(@Param('id') id: string) { return this.svc.remove(id) }
}
