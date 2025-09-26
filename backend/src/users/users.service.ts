import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } })
    }

    async create(email: string, password: string, role: Role = 'USER') {
        const hash = await bcrypt.hash(password, 10)
        return this.prisma.user.create({ data: { email, password: hash, role } })
    }
}
