import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { RealtimeGateway } from '../realtime/realtime.gateway'

@Injectable()
export class SchedulesService {
    constructor(private prisma: PrismaService, private rt: RealtimeGateway) {}

    private assertTimes(departAt: Date, arriveAt: Date) {
        if (!(departAt instanceof Date) || !(arriveAt instanceof Date) || isNaN(+departAt) || isNaN(+arriveAt)) {
            throw new BadRequestException('Invalid dates')
        }
        if (arriveAt <= departAt) {
            throw new BadRequestException('arriveAt must be after departAt')
        }
    }

    async list(date: string, routeId?: string, trainType?: any, page = 1, pageSize = 20) {
        const d = new Date(date)
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
        const skip = (Math.max(1, page) - 1) * Math.max(1, pageSize)
        const take = Math.max(1, pageSize)

        const where = {
            departAt: { gte: start, lt: end },
            ...(routeId ? { routeId } : {}),
            ...(trainType ? { trainType } : {}),
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.schedule.findMany({
                where,
                orderBy: { departAt: 'asc' },
                include: { route: { include: { stops: { include: { stop: true }, orderBy: { order: 'asc' } } } } },
                skip,
                take,
            }),
            this.prisma.schedule.count({ where }),
        ])

        return { items, total, page, pageSize }
    }

    async create(dto: CreateScheduleDto) {
        if (!dto.routeId) throw new BadRequestException('routeId is required')

        const route = await this.prisma.route.findUnique({ where: { id: dto.routeId } })
        if (!route) throw new NotFoundException('Route not found')

        const departAt = new Date(dto.departAt)
        const arriveAt = new Date(dto.arriveAt)
        this.assertTimes(departAt, arriveAt)

        const created = await this.prisma.schedule.create({
            data: {
                routeId: dto.routeId,
                trainType: dto.trainType,
                departAt,
                arriveAt,
                status: dto.status ?? 'ON_TIME',
                delayMinutes: dto.delayMinutes ?? 0,
            },
        })
        this.rt.emitScheduleChanged({ type: 'CREATED', scheduleId: created.id })
        return created
    }

    async update(id: string, dto: UpdateScheduleDto) {
        const patch: any = {}
        if (dto.departAt) patch.departAt = new Date(dto.departAt)
        if (dto.arriveAt) patch.arriveAt = new Date(dto.arriveAt)

        if (patch.departAt || patch.arriveAt) {
            const existing = await this.prisma.schedule.findUnique({ where: { id } })
            const departAt = patch.departAt ?? existing?.departAt
            const arriveAt = patch.arriveAt ?? existing?.arriveAt
            this.assertTimes(departAt as Date, arriveAt as Date)
        }

        const updated = await this.prisma.schedule.update({ where: { id }, data: { ...dto, ...patch } })
        this.rt.emitScheduleChanged({ type: 'UPDATED', scheduleId: id })
        return updated
    }

    async remove(id: string) {
        const removed = await this.prisma.schedule.delete({ where: { id } })
        this.rt.emitScheduleChanged({ type: 'DELETED', scheduleId: id })
        return removed
    }
}
