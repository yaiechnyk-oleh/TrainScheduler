import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { RoutesModule } from './routes/routes.module'
import { StopsModule } from './stops/stops.module'
import { SchedulesModule } from './schedules/schedules.module'
import { FavoritesModule } from './favorites/favorites.module'
import { RealtimeModule } from './realtime/realtime.module'
import {seconds, ThrottlerModule} from '@nestjs/throttler'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: seconds(60), limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    RoutesModule,
    StopsModule,
    SchedulesModule,
    FavoritesModule,
    RealtimeModule,
  ],
})
export class AppModule {}
