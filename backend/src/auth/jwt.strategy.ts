import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Role } from '@prisma/client'

export type JwtPayload = { sub: string; role: Role }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || 'dev_secret',
            issuer: process.env.JWT_ISSUER || 'trains-api',
            audience: process.env.JWT_AUDIENCE || 'trains-mobile',
            ignoreExpiration: false,
        })
    }
    async validate(payload: JwtPayload) { return { userId: payload.sub, role: payload.role } }
}
