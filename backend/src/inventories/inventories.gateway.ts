import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InventoryUserRoles } from 'src/inventoryUsers/inventoryUserRoles.enum';

interface InventoryUserLocale {
  id: number;
  name: string;
  role: InventoryUserRoles;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  path: '/api/socket.io',
})
export class InventoriesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private inventoryUsers = new Map<any, Map<any, any>>();

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    const { inventoryId, username } = socket.data as any;

    if (inventoryId) {
      socket.leave(inventoryId);

      const users = this.inventoryUsers.get(inventoryId);
      if (users) {
        users.delete(socket.id);
        if (users.size === 0) {
          this.inventoryUsers.delete(inventoryId);
        }
      }

      this.server.to(inventoryId).emit('user-left', {
        username,
        socketId: socket.id,
      });
    }

    console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(@MessageBody() email: string, @ConnectedSocket() client: Socket) {
    if (!email) return;
    client.join(email);
    console.log(`User joined room: ${email}`);
  }

  @SubscribeMessage('join-inventory')
  handleJoinPresentation(@MessageBody() data: { inventoryId: number; user: InventoryUserLocale }, @ConnectedSocket() socket: Socket) {
    const { inventoryId, user } = data;

    socket.join(String(inventoryId));
    socket.data.inventoryId = inventoryId;
    socket.data.user = user;

    let usersMap = this.inventoryUsers.get(inventoryId);
    if (!usersMap) {
      usersMap = new Map();
      this.inventoryUsers.set(inventoryId, usersMap);
    }

    usersMap.set(socket.id, {
      socketId: socket.id,
      user,
    });

    this.server.to(String(inventoryId)).emit('user-joined', {
      socketId: socket.id,
      user,
    });
  }
}
