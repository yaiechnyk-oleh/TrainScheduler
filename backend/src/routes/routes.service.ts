import {Injectable, NotFoundException} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRouteDto } from './dto/create-route.dto'
import { UpdateRouteDto } from './dto/update-route.dto'
import { SetStopsDto } from './dto/set-stops.dto'
import { RealtimeGateway } from '../realtime/realtime.gateway'

@Injectable()
export class RoutesService {
    constructor(private prisma: PrismaService, private rt: RealtimeGateway) {}

    list() {
        return this.prisma.route.findMany({
            orderBy: { name: 'asc' },
            include: { stops: { include: { stop: true }, orderBy: { order: 'asc' } } },
        })
    }

    async findOne(id: string, date?: string) {
        const include: any = {
            stops: { include: { stop: true }, orderBy: { order: 'asc' } },
        }

        if (date) {
            const d = new Date(date)
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
            const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
            include.schedules = {
                where: { departAt: { gte: start, lt: end } },
                orderBy: { departAt: 'asc' },
            }
        }

        const route = await this.prisma.route.findUnique({
            where: { id },
            include,
        })
        if (!route) throw new NotFoundException('Route not found')
        return route
    }

   async create(dto: CreateRouteDto) {
        const created = await this.prisma.route.create({ data: dto })
        this.rt.emitRouteChanged({ type: 'CREATED', routeId: created.id })
        return created
    }

    async update(id: string, dto: UpdateRouteDto) {
        const updated = await this.prisma.route.update({ where: { id }, data: dto })
        this.rt.emitRouteChanged({ type: 'UPDATED', routeId: id })
        return updated

    }

    async remove(id: string) {
        const removed = await this.prisma.route.delete({ where: { id } })
        this.rt.emitRouteChanged({ type: 'DELETED', routeId: id })
        return removed
    }

    async setStops(routeId: string, dto: SetStopsDto) {
        await this.prisma.routeStop.deleteMany({ where: { routeId } })
        await this.prisma.routeStop.createMany({
            data: dto.stops.map(s => ({ routeId, stopId: s.stopId, order: s.order })),
        })

        const route = await this.prisma.route.findUnique({
            where: { id: routeId },
            include: { stops: { include: { stop: true }, orderBy: { order: 'asc' } } },
        })

        this.rt.emitRouteChanged({ type: 'UPDATED', routeId })
        this.rt.emitStopChanged({ type: 'UPDATED', routeId })

        return route
    }
}
