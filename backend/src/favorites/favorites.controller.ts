import {Body, Controller, Delete, Get, Param, Post, UseGuards} from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { GetUser } from '../auth/get-user.decorator'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
    constructor(private svc: FavoritesService) {}

    @Get()
    @ApiOkResponse({
        description: 'Favorited routes',
        schema: {
            example: [
                { route: { id: 'r_1', name: 'Kyiv → Lviv (fast line)', code: 'IC-721' } }
            ]
        }
    })
    list(@GetUser() u: { userId: string }) { return this.svc.list(u.userId) }

    @Post()
    @ApiOkResponse({ description: 'Favorite added', schema: { example: { userId: 'u_1', routeId: 'r_1' } } })
    add(@GetUser() u: { userId: string }, @Body('routeId') routeId: string) { return this.svc.add(u.userId, routeId) }

    @Delete(':routeId')
    @ApiOkResponse({
        description: 'Favorite removed',
        schema: { example: { userId: 'u_1', routeId: 'r_1' } },
    })
    remove(@GetUser() u: { userId: string }, @Param('routeId') routeId: string) {
        return this.svc.remove(u.userId, routeId)
    }
}
