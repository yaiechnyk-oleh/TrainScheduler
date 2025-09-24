import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class FavoritesService {
    constructor(private prisma: PrismaService) {}

    list(userId: string) {
        return this.prisma.favorite.findMany({ where: { userId }, include: { route: true } })
    }
    add(userId: string, routeId: string) {
        return this.prisma.favorite.create({ data: { userId, routeId } })
    }
    remove(userId: string, routeId: string) {
        return this.prisma.favorite.delete({ where: { userId_routeId: { userId, routeId } } })
    }
}
