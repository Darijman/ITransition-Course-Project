import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InventoryInvite } from './inventoryInvite.entity';
import { CreateInventoryInviteDto } from './createInventoryInvite.dto';
import { InventoriesService } from 'src/inventories/inventories.service';
import { InventoryUserRoles } from 'src/inventoryUsers/inventoryUserRoles.enum';
import { ReqUser } from 'src/interfaces/ReqUser';
import { UserRoles } from 'src/users/userRoles.enum';
import { User } from 'src/users/user.entity';
import { InventoryInviteStatuses } from './inventoryInviteStatuses.enum';
import { InventoryUsersService } from 'src/inventoryUsers/inventoryUsers.service';
import { InventoriesGateway } from 'src/inventories/inventories.gateway';
import { Notifications } from 'src/notifications/notification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

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

    private readonly inventoriesService: InventoriesService,
    private readonly inventoryUsersService: InventoryUsersService,
    private readonly notificationsService: NotificationsService,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

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
      .leftJoinAndSelect('inventory.category', 'category') // категория
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

  async getInvitesByInventoryId(inventoryId: number): Promise<InventoryInvite[]> {
    if (!inventoryId || isNaN(inventoryId)) {
      throw new BadRequestException({ error: 'Invalid Inventory ID!' });
    }

    const inventory = await this.inventoriesService.getInventoryById(inventoryId);
    if (!inventory) {
      throw new NotFoundException({ error: 'Inventory not found!' });
    }

    const invites = await this.inventoryInvitesRepository.find({ where: { inventoryId } });
    return invites;
  }

  async createNewInventoryInvite(createInventoryInviteDto: CreateInventoryInviteDto, reqUser: ReqUser): Promise<InventoryInvite> {
    const { inventoryId, inviterInventoryUserId, inviteeEmail, role, expiresAt } = createInventoryInviteDto;

    const inventory = await this.inventoriesService.getInventoryById(inventoryId, reqUser);
    const inviter = inventory.inventoryUsers.find((u) => u.id === inviterInventoryUserId);
    if (!inviter) throw new BadRequestException({ error: 'Inviter is not part of this inventory!' });

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
    if (existingInvite) {
      if (existingInvite.status === InventoryInviteStatuses.PENDING || existingInvite.status === InventoryInviteStatuses.ACCEPTED) {
        throw new ConflictException({ error: 'Invite already exists and cannot be sent!' });
      }
    }

    const newInvite = this.inventoryInvitesRepository.create({
      inventoryId,
      inviterInventoryUserId,
      inviteeEmail,
      role,
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7days default
      status: InventoryInviteStatuses.PENDING,
    });

    const savedInvite = await this.inventoryInvitesRepository.save(newInvite);
    const inviteWithRelations = await this.inventoryInvitesRepository.findOne({
      where: { id: savedInvite.id },
      relations: ['inventory', 'inviter', 'inventory.creator', 'inventory.category'],
    });

    const notification = await this.notificationsService.createNotification({
      userId: user.id,
      type: Notifications.INVITE,
      data: savedInvite,
    });

    this.inventoriesGateway.server.to(inviteeEmail).emit('notification', notification);
    this.inventoriesGateway.server.to(inviteeEmail).emit('inventory-invite', inviteWithRelations);
    return savedInvite;
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

      await this.inventoryInvitesRepository.save(invite);
      acceptedInvites.push(invite);
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
      await this.inventoryInvitesRepository.save(invite);

      rejectedInvites.push(invite);
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

  async deleteInventoryInviteById(inviteId: number): Promise<{ success: boolean }> {
    if (!inviteId || isNaN(inviteId)) {
      throw new BadRequestException({ error: 'Invalid Inventory Invite ID!' });
    }

    const inventoryInvite = await this.inventoryInvitesRepository.findOne({ where: { id: inviteId } });
    if (!inventoryInvite) {
      throw new NotFoundException({ error: 'Inventory Invite not found!' });
    }

    await this.inventoryInvitesRepository.delete(inviteId);
    return { success: true };
  }
}
