import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateStopDto } from './dto/create-stop.dto'
import { UpdateStopDto } from './dto/update-stop.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class StopsService {
    constructor(private prisma: PrismaService) {}

    list() {
        return this.prisma.stop.findMany({ orderBy: { name: 'asc' } })
    }

    create(dto: CreateStopDto) {
        return this.prisma.stop.create({
            data: {
                name: dto.name,
                city: dto.city,
                ...(dto.lat !== undefined ? { lat: new Prisma.Decimal(dto.lat) } : {}),
                ...(dto.lng !== undefined ? { lng: new Prisma.Decimal(dto.lng) } : {}),
            },
        })
    }

    update(id: string, dto: UpdateStopDto) {
        return this.prisma.stop.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.city !== undefined ? { city: dto.city } : {}),
                ...(dto.lat !== undefined ? { lat: new Prisma.Decimal(dto.lat) } : {}),
                ...(dto.lng !== undefined ? { lng: new Prisma.Decimal(dto.lng) } : {}),
            },
        })
    }

    remove(id: string) {
        return this.prisma.stop.delete({ where: { id } })
    }
}
