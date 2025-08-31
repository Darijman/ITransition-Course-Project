import { Notifications } from './Notifications.enum';
import { User } from '../users/User';
import { NotificationStatuses } from './NotificationStatuses.enum';

export interface Notification {
  id: number;
  user?: User;
  userId: number;
  type: Notifications;
  data: any | null;
  status: NotificationStatuses;
  createdAt: string;
  updatedAt: string;
}
