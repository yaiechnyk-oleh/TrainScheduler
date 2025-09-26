import { Module } from '@nestjs/common'
import { StopsService } from './stops.service'
import { StopsController } from './stops.controller'
import {RealtimeModule} from "../realtime/realtime.module";

@Module({
  imports: [RealtimeModule],
  controllers: [StopsController],
  providers: [StopsService],
})
export class StopsModule {}
