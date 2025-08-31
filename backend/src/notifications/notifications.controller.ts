import { Controller, Get, Param, Delete, Patch, UseGuards, Req, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { CustomParseIntPipe } from 'src/common/pipes/customParseIntPipe/CustomParseInt.pipe';
import { Admin } from 'src/auth/auth.decorators';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(AuthGuard)
  @Get('/user/count')
  async getUserUnreadCounts(@Req() req: Request) {
    return this.notificationsService.getUserUnreadCounts(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('/user')
  async getUserNotifications(@Req() req: Request) {
    return this.notificationsService.getUserNotifications(req.user);
  }

  @Admin()
  @UseGuards(AuthGuard)
  @Get()
  async getAllNotifications() {
    return await this.notificationsService.getAllNotifications();
  }

  @Admin()
  @UseGuards(AuthGuard)
  @Get(':notificationId')
  async getNotificationById(@Param('notificationId', new CustomParseIntPipe('Notification ID')) notificationId: number) {
    return this.notificationsService.getNotificationById(notificationId);
  }

  @UseGuards(AuthGuard)
  @Patch(':notificationId/read')
  async markNotificationAsRead(
    @Param('notificationId', new CustomParseIntPipe('Notification ID')) notificationId: number,
    @Req() req: Request,
  ) {
    return this.notificationsService.markNotificationAsRead(notificationId, req.user.id);
  }

  @UseGuards(AuthGuard)
  @Delete(':notificationId')
  async deleteNotification(@Param('notificationId', new CustomParseIntPipe('Notification ID')) notificationId: number, @Req() req: Request) {
    return this.notificationsService.deleteNotification(notificationId, req.user.id);
  }
}
