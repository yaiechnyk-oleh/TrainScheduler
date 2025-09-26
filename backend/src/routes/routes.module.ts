import { Module } from '@nestjs/common'
import { RoutesService } from './routes.service'
import { RoutesController } from './routes.controller'
import {RealtimeModule} from "../realtime/realtime.module";

@Module({
  imports: [RealtimeModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
