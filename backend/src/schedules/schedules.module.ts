import { Module } from '@nestjs/common'
import { SchedulesService } from './schedules.service'
import { SchedulesController } from './schedules.controller'
import { RealtimeModule } from '../realtime/realtime.module'

@Module({
    imports: [RealtimeModule],
    controllers: [SchedulesController],
    providers: [SchedulesService],
})
export class SchedulesModule {}
