import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { Role } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { randomUUID } from 'crypto'

type Tokens = { access_token: string; refresh_token: string }

@Injectable()
export class AuthService {
    constructor(
        private users: UsersService,
        private jwt: JwtService,
        private prisma: PrismaService,
    ) {}

    private async signTokens(sub: string, role: Role): Promise<Tokens> {
        const payload = { sub, role }
        const access_token = await this.jwt.signAsync(payload, {
            secret: process.env.JWT_SECRET || 'dev_secret',
            expiresIn: '15m',
            issuer: process.env.JWT_ISSUER || 'trains-api',
            audience: process.env.JWT_AUDIENCE || 'trains-mobile',
        })
        const jti = randomUUID()
        const refresh_token = await this.jwt.signAsync({ sub, jti }, {
            secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh',
            expiresIn: '7d',
            issuer: process.env.JWT_ISSUER || 'trains-api',
            audience: process.env.JWT_AUDIENCE || 'trains-mobile',
        })
        const hash = await bcrypt.hash(refresh_token, 10)
        const expMs = 7 * 24 * 60 * 60 * 1000
        await this.prisma.refreshToken.create({
            data: { jti, userId: sub, tokenHash: hash, expiresAt: new Date(Date.now() + expMs) },
        })
        return { access_token, refresh_token }
    }

    private async verifyRefreshToken(token: string) {
        try {
            const decoded = await this.jwt.verifyAsync<{ sub: string; jti: string }>(token, {
                secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh',
                issuer: process.env.JWT_ISSUER || 'trains-api',
                audience: process.env.JWT_AUDIENCE || 'trains-mobile',
            })
            const record = await this.prisma.refreshToken.findUnique({ where: { jti: decoded.jti } })
            if (!record || record.revoked || record.userId !== decoded.sub) throw new UnauthorizedException('Invalid refresh token')
            const ok = await bcrypt.compare(token, record.tokenHash)
            if (!ok) throw new UnauthorizedException('Invalid refresh token')
            return record
        } catch {
            throw new UnauthorizedException('Invalid refresh token')
        }
    }

    async register(email: string, password: string) {
        const exists = await this.users.findByEmail(email)
        if (exists) throw new UnauthorizedException('Email is already registered')
        const user = await this.users.create(email, password)
        return this.signTokens(user.id, user.role)
    }

    async login(email: string, password: string) {
        const user = await this.users.findByEmail(email)
        if (!user) throw new UnauthorizedException('Invalid credentials')
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) throw new UnauthorizedException('Invalid credentials')
        return this.signTokens(user.id, user.role)
    }

    async refresh(refreshToken: string): Promise<Tokens> {
        const record = await this.verifyRefreshToken(refreshToken)
        // rotate: revoke old and issue new
        await this.prisma.refreshToken.update({ where: { jti: record.jti }, data: { revoked: true } })
        const user = await this.prisma.user.findUniqueOrThrow({ where: { id: record.userId } })
        return this.signTokens(user.id, user.role)
    }

    async logout(refreshToken: string) {
        const record = await this.verifyRefreshToken(refreshToken)
        await this.prisma.refreshToken.update({ where: { jti: record.jti }, data: { revoked: true } })
        return { success: true }
    }
}
