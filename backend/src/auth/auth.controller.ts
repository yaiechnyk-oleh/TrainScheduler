import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ApiBadRequestResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import {seconds, Throttle, ThrottlerGuard} from '@nestjs/throttler'
import { TokensDto } from './dto/tokens.dto'
import { ApiError } from '../common/swagger/api-error.dto'

@ApiTags('auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) {}

    @Post('register')
    @Throttle({ default: { limit: 5, ttl: seconds(60) } })
    @ApiOkResponse({ description: 'Access + Refresh tokens', type: TokensDto })
    @ApiBadRequestResponse({ description: 'Email already registered / validation', type: ApiError })
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto.email, dto.password)
    }

    @Post('login')
    @Throttle({ default: { limit: 10, ttl: seconds(60) } })
    @ApiOkResponse({ description: 'Access + Refresh tokens', type: TokensDto })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials', type: ApiError })
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto.email, dto.password)
    }

    @Post('refresh')
    @Throttle({ default: { limit: 10, ttl: seconds(60) } })
    @ApiOkResponse({ description: 'Rotated tokens', type: TokensDto })
    @ApiUnauthorizedResponse({ description: 'Invalid refresh token', type: ApiError })
    refresh(@Body('refreshToken') token: string) {
        return this.auth.refresh(token)
    }

    @Post('logout')
    @Throttle({ default: { limit: 10, ttl: seconds(60) } })
    @ApiOkResponse({ schema: { example: { success: true } } })
    @ApiUnauthorizedResponse({ description: 'Invalid refresh token', type: ApiError })
    logout(@Body('refreshToken') token: string) {
        return this.auth.logout(token)
    }
}
