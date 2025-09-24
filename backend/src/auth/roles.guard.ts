import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    canActivate(ctx: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<Array<'USER'|'ADMIN'>>(ROLES_KEY, [
            ctx.getHandler(),
            ctx.getClass(),
        ])
        if (!required?.length) return true
        const req = ctx.switchToHttp().getRequest()
        const user = req.user
        return user && required.includes(user.role)
    }
}
