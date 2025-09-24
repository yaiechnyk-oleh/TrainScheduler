import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeGateway implements OnGatewayInit {
  @WebSocketServer() server: Server
  afterInit() {}
  emitScheduleChanged(payload: any) {
    this.server.emit('schedule.updated', payload)
  }
}
