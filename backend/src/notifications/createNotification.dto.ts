import { IsEnum, IsInt, IsOptional, IsObject } from 'class-validator';
import { Notifications } from './notification.entity';

export class CreateNotificationDto {
  @IsInt()
  userId: number;

  @IsEnum(Notifications)
  type: Notifications;

  @IsOptional()
  @IsObject()
  data?: any;
}
