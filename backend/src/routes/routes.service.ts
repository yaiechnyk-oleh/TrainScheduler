import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRouteDto } from './dto/create-route.dto'
import { UpdateRouteDto } from './dto/update-route.dto'
import { SetStopsDto } from './dto/set-stops.dto'

@Injectable()
export class RoutesService {
    constructor(private prisma: PrismaService) {}

    list() {
        return this.prisma.route.findMany({
            orderBy: { name: 'asc' },
            include: { stops: { include: { stop: true }, orderBy: { order: 'asc' } } },
        })
    }

    create(dto: CreateRouteDto) {
        return this.prisma.route.create({ data: dto })
    }

    update(id: string, dto: UpdateRouteDto) {
        return this.prisma.route.update({ where: { id }, data: dto })
    }

    remove(id: string) {
        return this.prisma.route.delete({ where: { id } })
    }

    async setStops(routeId: string, dto: SetStopsDto) {
        await this.prisma.routeStop.deleteMany({ where: { routeId } })
        await this.prisma.routeStop.createMany({
            data: dto.stops.map(s => ({ routeId, stopId: s.stopId, order: s.order })),
        })
        return this.prisma.route.findUnique({
            where: { id: routeId },
            include: { stops: { include: { stop: true }, orderBy: { order: 'asc' } } },
        })
    }
}
