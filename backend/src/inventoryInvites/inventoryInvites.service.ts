import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InventoryInvite } from './inventoryInvite.entity';
import { CreateInventoryInviteDto } from './createInventoryInvite.dto';
import { InventoryUserRoles } from 'src/inventoryUsers/inventoryUserRoles.enum';
import { ReqUser } from 'src/interfaces/ReqUser';
import { UserRoles } from 'src/users/userRoles.enum';
import { User } from 'src/users/user.entity';
import { InventoryInviteStatuses } from './inventoryInviteStatuses.enum';
import { InventoryUsersService } from 'src/inventoryUsers/inventoryUsers.service';
import { InventoriesGateway } from 'src/inventories/inventories.gateway';
import { Notifications } from 'src/notifications/notification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Inventory } from 'src/inventories/inventory.entity';

interface Query {
  limit?: number;
  offset?: number;
  status?: InventoryInviteStatuses | 'ALL';
  searchValue?: string;
}

@Injectable()
export class InventoryInvitesService {
  constructor(
    @InjectRepository(InventoryInvite)
    private readonly inventoryInvitesRepository: Repository<InventoryInvite>,

    @InjectRepository(Inventory)
    private readonly inventoriesRepository: Repository<Inventory>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly inventoryUsersService: InventoryUsersService,
    private readonly notificationsService: NotificationsService,
    private readonly inventoriesGateway: InventoriesGateway,
  ) {}

  async getAllInventoryInvites(): Promise<InventoryInvite[]> {
    return await this.inventoryInvitesRepository.find();
  }

  async getUserInvitesByEmail(inviteeEmail: string, query: Query): Promise<InventoryInvite[]> {
    if (!inviteeEmail) {
      throw new BadRequestException({ error: 'Invalid email!' });
    }

    const { offset = 0, limit = 10, status = 'ALL', searchValue } = query;
    const qb = this.inventoryInvitesRepository
      .createQueryBuilder('invite')
      .leftJoinAndSelect('invite.inventory', 'inventory')
      .leftJoinAndSelect('inventory.category', 'category')
      .leftJoinAndSelect('inventory.tags', 'tags')
      .leftJoinAndSelect('invite.inviter', 'inviter')
      .leftJoinAndSelect('inventory.creator', 'creator')
      .where('invite.inviteeEmail = :inviteeEmail', { inviteeEmail });

    if (status && status !== 'ALL') {
      qb.andWhere('invite.status = :status', { status });
    }

    if (searchValue) {
      qb.andWhere('inventory.title LIKE :search', { search: `%${searchValue}%` });
    }

    qb.orderBy('invite.createdAt', 'DESC').skip(offset).take(limit);

    return await qb.getMany();
  }

  async getInvitesByInventoryId(
    inventoryId: number,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
      searchValue?: string;
    } = {},
  ): Promise<InventoryInvite[]> {
    const { limit = 10, offset = 0, status, searchValue } = options;

    if (!inventoryId || isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Invalid Inventory ID!' });
    }

    const inventory = await this.inventoriesRepository.findOneBy({ id: inventoryId });
    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }

    const query = this.inventoryInvitesRepository
      .createQueryBuilder('invite')
      .leftJoinAndSelect('invite.inviter', 'inviter')
      .leftJoinAndSelect('inviter.user', 'inviterUser')
      .leftJoinAndSelect('invite.invitee', 'invitee')
      .leftJoinAndSelect('invitee.user', 'inviteeUser')
      .leftJoinAndSelect('invite.inviteeUser', 'directInvitee')
      .where('invite.inventoryId = :inventoryId', { inventoryId });

    if (status && status !== 'ALL') {
      query.andWhere('invite.status = :status', { status });
    }

    if (searchValue) {
      const likeSearch = `%${searchValue.toLowerCase()}%`;

      query.andWhere(
        `(LOWER(invite.inviteeEmail) LIKE :search
        OR LOWER(inviterUser.name) LIKE :search
        OR LOWER(inviterUser.email) LIKE :search
        OR LOWER(inviteeUser.name) LIKE :search
        OR LOWER(inviteeUser.email) LIKE :search
        OR LOWER(directInvitee.name) LIKE :search
        OR LOWER(directInvitee.email) LIKE :search)`,
        { search: likeSearch },
      );
    }

    return query.skip(offset).take(limit).orderBy('invite.createdAt', 'DESC').getMany();
  }

  async createNewInventoryInvite(createInventoryInviteDto: CreateInventoryInviteDto, reqUser: ReqUser): Promise<InventoryInvite> {
    const { inventoryId, inviterInventoryUserId, inviteeEmail, role, expiresAt } = createInventoryInviteDto;

    const inventory = await this.inventoriesRepository.findOne({
      where: { id: inventoryId },
      relations: ['inventoryUsers'],
    });
    if (!inventory) {
      throw new BadRequestException({ error: 'Inventory not found!' });
    }

    const inviter = inventory.inventoryUsers.find((u) => u.id === inviterInventoryUserId);
    if (!inviter) {
      throw new BadRequestException({ error: 'Inviter is not part of this inventory!' });
    }

    if (reqUser.role !== UserRoles.ADMIN && inviter.role !== InventoryUserRoles.CREATOR) {
      throw new ForbiddenException({ error: 'You do not have rights to invite users!' });
    }

    const user = await this.usersRepository.findOne({ where: { email: inviteeEmail } });
    if (!user) {
      throw new NotFoundException({ error: 'User with this email does not exist!' });
    }

    const isUserInInventory = inventory.inventoryUsers.some((u) => u.userId === user.id);
    if (isUserInInventory) {
      throw new ConflictException({ error: 'User is already a member of this inventory!' });
    }

    const existingInvite = await this.inventoryInvitesRepository.findOne({ where: { inventoryId, inviteeEmail } });
    if (existingInvite && existingInvite.status === InventoryInviteStatuses.PENDING) {
      throw new ConflictException({ error: 'Invite already exists and cannot be sent!' });
    }

    const newInvite = this.inventoryInvitesRepository.create({
      inventoryId,
      inviterInventoryUserId,
      inviteeEmail,
      inviteeUserId: user.id,
      role,
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7days default
      status: InventoryInviteStatuses.PENDING,
    });

    const savedInvite = await this.inventoryInvitesRepository.save(newInvite);
    const inviteWithRelations = await this.inventoryInvitesRepository.findOne({
      where: { id: savedInvite.id },
      relations: ['inviter', 'inviter.user', 'inviteeUser', 'invitee', 'inventory', 'inventory.creator', 'inventory.category'],
    });

    if (!inviteWithRelations) {
      throw new BadRequestException({ error: 'Failed to find new invite!' });
    }

    const notification = await this.notificationsService.createNotification({
      userId: user.id,
      type: Notifications.INVITE,
      data: savedInvite,
    });

    this.inventoriesGateway.server.to(inviteeEmail).emit('invite-notification-created', notification);
    this.inventoriesGateway.server.to(inviteeEmail).emit('inventory-invite-created', inviteWithRelations);
    return inviteWithRelations;
  }

  async acceptInventoryInvites(inviteIds: number[], reqUser: ReqUser): Promise<InventoryInvite[]> {
    const invites = await this.inventoryInvitesRepository.findBy({ id: In(inviteIds) });
    if (!invites.length) {
      throw new NotFoundException({ error: 'Invites not found!' });
    }

    const acceptedInvites: InventoryInvite[] = [];

    for (const invite of invites) {
      if (invite.status !== InventoryInviteStatuses.PENDING) {
        throw new BadRequestException({ error: `Invite ${invite.id} is not pending!` });
      }

      if (invite.expiresAt && invite.expiresAt < new Date()) {
        invite.status = InventoryInviteStatuses.EXPIRED;
        await this.inventoryInvitesRepository.save(invite);
        throw new BadRequestException({ error: `Invite ${invite.id} has expired!` });
      }

      if (reqUser.email !== invite.inviteeEmail) {
        throw new ForbiddenException({ error: `Invite ${invite.id} is not for you!` });
      }

      const newInventoryUser = {
        inventoryId: invite.inventoryId,
        userId: reqUser.id,
        role: invite.role,
      };

      const inventoryUser = await this.inventoryUsersService.createNewInventoryUser(newInventoryUser);

      invite.status = InventoryInviteStatuses.ACCEPTED;
      invite.inviteeInventoryUserId = inventoryUser.id;
      const savedInvite = await this.inventoryInvitesRepository.save(invite);

      this.inventoriesGateway.server.to(`${invite.inventoryId}`).emit('inventory-invite-updated', savedInvite);

      acceptedInvites.push(savedInvite);

      const inventoryWithRelations = await this.inventoriesRepository.findOne({
        where: { id: invite.inventoryId },
        relations: ['creator', 'category', 'tags', 'items'],
      });

      if (inventoryWithRelations) {
        const extendedInventory = {
          ...inventoryWithRelations,
          joinedAt: inventoryUser.createdAt,
        };

        this.inventoriesGateway.server.to(reqUser.email).emit('inventory-invite-accepted', extendedInventory);
      }
    }

    return acceptedInvites;
  }

  async rejectInventoryInvites(inviteIds: number[], reqUser: ReqUser): Promise<InventoryInvite[]> {
    const invites = await this.inventoryInvitesRepository.findBy({ id: In(inviteIds) });
    if (!invites.length) {
      throw new NotFoundException({ error: 'Invites not found!' });
    }

    const rejectedInvites: InventoryInvite[] = [];

    for (const invite of invites) {
      if (invite.status !== InventoryInviteStatuses.PENDING) {
        throw new BadRequestException({ error: `Invite ${invite.id} is not pending!` });
      }

      if (reqUser.email !== invite.inviteeEmail) {
        throw new ForbiddenException({ error: `Invite ${invite.id} is not for you!` });
      }

      invite.status = InventoryInviteStatuses.REJECTED;
      const saved = await this.inventoryInvitesRepository.save(invite);

      this.inventoriesGateway.server.to(`${invite.inventoryId}`).emit('inventory-invite-updated', saved);
      rejectedInvites.push(saved);
    }

    return rejectedInvites;
  }

  async getInventoryInviteById(inviteId: number): Promise<InventoryInvite> {
    if (!inviteId || isNaN(inviteId)) {
      throw new BadRequestException({ error: 'Invalid Inventory Invite ID!' });
    }

    const inventoryInvite = await this.inventoryInvitesRepository.findOne({ where: { id: inviteId } });
    if (!inventoryInvite) {
      throw new NotFoundException({ error: 'Inventory Invite not found!' });
    }
    return inventoryInvite;
  }

  async deleteInventoryInvitesByIds(inviteIds: number[]): Promise<{ success: boolean }> {
    if (!inviteIds || !Array.isArray(inviteIds) || inviteIds.some((id) => isNaN(id))) {
      throw new BadRequestException({ error: 'Invalid Inventory Invite IDs!' });
    }

    const existingInvites = await this.inventoryInvitesRepository.findBy({ id: In(inviteIds) });
    if (!existingInvites.length) {
      throw new NotFoundException({ error: 'No Inventory Invites found for the given IDs!' });
    }

    const notificationsToDelete: { id: number; userEmail: string; type: Notifications }[] = [];
    for (const invite of existingInvites) {
      const notifications = await this.notificationsService.getNotificationsByInviteId(invite.id);
      notifications.forEach((notif) => {
        notificationsToDelete.push({ id: notif.id, userEmail: invite.inviteeEmail, type: notif.type });
      });
    }

    if (notificationsToDelete.length) {
      const notifIds = notificationsToDelete.map((n) => n.id);
      await this.notificationsService.deleteNotificationsByIds(notifIds);

      notificationsToDelete.forEach((n) => {
        this.inventoriesGateway.server.to(n.userEmail).emit('invite-notification-deleted', {
          id: n.id,
          type: n.type,
        });
      });
    }
    await this.inventoryInvitesRepository.delete(inviteIds);

    existingInvites.forEach((invite) => {
      this.inventoriesGateway.server.to(invite.inviteeEmail).emit('inventory-invite-deleted', {
        inviteId: invite.id,
        inventoryId: invite.inventoryId,
      });

      this.inventoriesGateway.server.to(`${invite.inventoryId}`).emit('inventory-invite-deleted', {
        inviteId: invite.id,
        inventoryId: invite.inventoryId,
      });
    });

    return { success: true };
  }
}
