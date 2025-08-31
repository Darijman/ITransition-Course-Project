import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, Notifications, NotificationStatus } from './notification.entity';
import { CreateNotificationDto } from './createNotification.dto';
import { User } from 'src/users/user.entity';
import { ReqUser } from 'src/interfaces/ReqUser';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getAllNotifications(): Promise<Notification[]> {
    return await this.notificationsRepository.find();
  }

  async getNotificationById(notificationId: number): Promise<Notification> {
    if (!notificationId || isNaN(notificationId)) {
      throw new BadRequestException({ error: 'Invalid Notification ID!' });
    }

    const notification = await this.notificationsRepository.findOne({ where: { id: notificationId } });
    if (!notification) {
      throw new NotFoundException({ error: 'Notification not found!' });
    }
    return notification;
  }

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const { userId, type, data } = createNotificationDto;

    const userExists = await this.usersRepository.findOne({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundException({ error: 'User not found!' });
    }

    const notification = this.notificationsRepository.create({
      userId,
      type,
      data: data || null,
      status: NotificationStatus.UNREAD,
    });

    return this.notificationsRepository.save(notification);
  }

  async getUserUnreadCounts(userId: number): Promise<Record<Notifications, number> & { TOTAL: number }> {
    const notifications = await this.notificationsRepository
      .createQueryBuilder('n')
      .select('n.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('n.userId = :userId', { userId })
      .andWhere('n.status = :status', { status: NotificationStatus.UNREAD })
      .groupBy('n.type')
      .getRawMany();

    const result: Record<Notifications, number> = {
      INVITE: 0,
    };

    notifications.forEach((n) => {
      result[n.type as Notifications] = parseInt(n.count, 10);
    });

    const TOTAL = Object.values(result).reduce((acc, val) => acc + val, 0);
    return { ...result, TOTAL };
  }

  async getUserNotifications(reqUser: ReqUser, limit: number = 20): Promise<Notification[]> {
    const userExists = await this.usersRepository.findOne({ where: { id: reqUser.id } });
    if (!userExists) {
      throw new NotFoundException({ error: 'User not found!' });
    }

    return await this.notificationsRepository.find({
      where: { userId: reqUser.id },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({ where: { id: notificationId, userId } });
    if (!notification) {
      throw new NotFoundException({ error: 'Notification not found!' });
    }

    notification.status = NotificationStatus.READ;
    return this.notificationsRepository.save(notification);
  }

  async deleteNotification(notificationId: number, userId: number): Promise<{ success: boolean }> {
    const notification = await this.notificationsRepository.findOne({ where: { id: notificationId, userId } });
    if (!notification) {
      throw new NotFoundException({ error: 'Notification not found!' });
    }

    await this.notificationsRepository.delete(notification.id);
    return { success: true };
  }
}
