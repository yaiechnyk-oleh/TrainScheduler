import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

type CUD = 'CREATED' | 'UPDATED' | 'DELETED'

@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeGateway implements OnGatewayInit {
  @WebSocketServer() server: Server
  afterInit() {}

  emitScheduleChanged(payload: { type: CUD; scheduleId: string }) {
    this.server.emit('schedule.changed', payload)
  }

  emitRouteChanged(payload: { type: CUD; routeId: string }) {
    this.server.emit('route.changed', payload)
  }

  emitStopChanged(payload: { type: CUD; stopId?: string; routeId?: string }) {
    this.server.emit('stop.changed', payload)
  }
}
