import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateStopDto } from './dto/create-stop.dto'
import { UpdateStopDto } from './dto/update-stop.dto'
import { Prisma } from '@prisma/client'
import { RealtimeGateway } from '../realtime/realtime.gateway'

@Injectable()
export class StopsService {
    constructor(private prisma: PrismaService, private rt: RealtimeGateway) {}

    list() {
        return this.prisma.stop.findMany({ orderBy: { name: 'asc' } })
    }

    async create(dto: CreateStopDto) {
        const created = await this.prisma.stop.create({
            data: {
                name: dto.name,
                city: dto.city,
                ...(dto.lat !== undefined ? { lat: new Prisma.Decimal(dto.lat) } : {}),
                ...(dto.lng !== undefined ? { lng: new Prisma.Decimal(dto.lng) } : {}),
            },
        })
        this.rt.emitStopChanged({ type: 'CREATED', stopId: created.id })
        return created
    }

    async update(id: string, dto: UpdateStopDto) {
        const updated = await this.prisma.stop.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.city !== undefined ? { city: dto.city } : {}),
                ...(dto.lat !== undefined ? { lat: new Prisma.Decimal(dto.lat) } : {}),
                ...(dto.lng !== undefined ? { lng: new Prisma.Decimal(dto.lng) } : {}),
            },
        })
        this.rt.emitStopChanged({ type: 'UPDATED', stopId: id })
        return updated
    }

    async remove(id: string) {
        const removed = await this.prisma.stop.delete({ where: { id } })
        this.rt.emitStopChanged({ type: 'DELETED', stopId: id })
        return removed
    }
}
