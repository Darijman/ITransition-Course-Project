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

  @SubscribeMessage('delete-item')
  handleDeleteSlide(
    @MessageBody()
    payload: {
      presentationId: string;
      slideId: string;
      userId: string;
    },
    @ConnectedSocket() socket: Socket,
  ) {
    const { presentationId, slideId, userId } = payload;
    if (socket.data.user.id !== userId) {
      return;
    }

    const username = socket.data.user.nickname;

    this.server.to(presentationId).emit('item-deleted', {
      slideId,
      userId,
      deletedBy: username,
    });
  }

  @SubscribeMessage('delete-inventory')
  handleDeletePresentation(@MessageBody() payload: { inventoryId: number }, @ConnectedSocket() socket: Socket) {
    const { inventoryId } = payload;
    const deletedBy = socket.data?.user?.nickname ?? 'unknown';

    this.server.to(String(inventoryId)).emit('inventory-deleted', {
      inventoryId,
      deletedBy,
    });

    this.inventoryUsers.delete(inventoryId);
  }

  @SubscribeMessage('get-users')
  handleGetUsers(@MessageBody() payload: { inventoryId: number }, @ConnectedSocket() socket: Socket) {
    const usersMap = this.inventoryUsers.get(payload.inventoryId);

    const users = usersMap
      ? Array.from(usersMap.entries()).map(([socketId, entry]) => ({
          socketId,
          user: entry.user,
        }))
      : [];

    socket.emit('users-in-inventory', users);
  }

  @SubscribeMessage('change-role')
  handleChangeRole(
    @MessageBody()
    payload: {
      presentationId: string;
      presentationUserId: string;
      newRole: any;
    },
    @ConnectedSocket() socket: Socket,
  ) {
    const { presentationId, presentationUserId, newRole } = payload;
    const updatedBy = socket.data?.user?.nickname ?? 'unknown';

    const usersMap = this.inventoryUsers.get(presentationId);
    if (!usersMap) return;

    const targetEntry = Array.from(usersMap.values()).find((entry) => entry.user.id === presentationUserId);
    if (!targetEntry) return;

    targetEntry.user.role = newRole;
    this.server.to(presentationId).emit('user-role-changed', {
      userId: presentationUserId,
      newRole,
      updatedBy,
      updatedUser: targetEntry.user,
    });

    this.server.to(targetEntry.socketId).emit('personal-role-changed', {
      message: `${updatedBy} has changed your role to ${newRole}`,
      newRole,
    });
  }

  @SubscribeMessage('update-inventory-title')
  handlePresentationTitleUpdated(@MessageBody() payload: { presentationId: string; title: string }, @ConnectedSocket() socket: Socket) {
    const { presentationId, title } = payload;
    const updatedBy = socket.data?.user?.nickname ?? 'unknown';

    this.server.to(presentationId).emit('inventory-title-updated', {
      presentationId,
      title,
      updatedBy,
    });
  }
}
