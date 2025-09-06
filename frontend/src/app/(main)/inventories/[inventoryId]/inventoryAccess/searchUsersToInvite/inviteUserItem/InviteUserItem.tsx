import { Avatar, Button, message, Tooltip, Typography, Popover } from 'antd';
import { User } from '@/interfaces/users/User';
import { useState } from 'react';
import { TeamOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { Inventory } from '@/interfaces/inventories/Inventory';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { UserRoles } from '@/interfaces/users/UserRoles.enum';
import Link from 'next/link';
import api from '../../../../../../../../axiosConfig';
import './inviteUserItem.css';

const { Text } = Typography;

interface Props {
  user: User;
  disabled?: boolean;
  currentInventoryUser: InventoryUser | null;
  inventory: Inventory | null;
}

export const InviteUserItem = ({ user, disabled, currentInventoryUser, inventory }: Props) => {
  const { user: authUser } = useAuth();
  const { id, avatarUrl, name, email } = user;
  const t = useTranslations();

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);

  const inviteUserHandler = async (role: InventoryUserRoles) => {
    setPopoverVisible(false);

    if (
      (currentInventoryUser && currentInventoryUser.role !== InventoryUserRoles.CREATOR && authUser.role !== UserRoles.ADMIN) ||
      !inventory ||
      !currentInventoryUser
    )
      return;

    const newInvite = {
      inventoryId: inventory.id,
      inviterInventoryUserId: currentInventoryUser.id,
      inviteeEmail: email,
      role,
    };

    try {
      await api.post(`/inventory_invites/`, newInvite);
    } catch {
      messageApi.error({ content: t('inventory.access.invite_error') });
    }
  };

  const popoverContent = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Button type='primary' style={{ width: 120 }} onClick={() => inviteUserHandler(InventoryUserRoles.VIEWER)}>
        {t('inventory.roles.VIEWER')}
      </Button>
      <Button type='primary' style={{ width: 120 }} onClick={() => inviteUserHandler(InventoryUserRoles.EDITOR)}>
        {t('inventory.roles.EDITOR')}
      </Button>
    </div>
  );

  return (
    <li className='invite_user_item'>
      {contextHolder}

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href={`/users/${id}`}>
          <Avatar className='likes_list_modal_avatar' size={48} src={avatarUrl || '/no-avatar.svg'} style={{ cursor: 'pointer' }} />
        </Link>
        <Tooltip mouseEnterDelay={1} title={name}>
          <Text style={{ maxWidth: 50 }} ellipsis>
            {name}
          </Text>
        </Tooltip>
      </div>

      <div>
        <Popover
          content={popoverContent}
          title={<div style={{ textAlign: 'center' }}>{t('inventory.access.select_role')}</div>}
          trigger='click'
          open={popoverVisible}
          onOpenChange={(visible) => setPopoverVisible(visible)}
        >
          <Button className='invite_user_item_button' disabled={disabled} icon={<TeamOutlined style={{ fontSize: '15px' }} />} type='primary'>
            {disabled ? t('inventory.access.invited') : t('inventory.access.invite')}
          </Button>
        </Popover>
      </div>
    </li>
  );
};
