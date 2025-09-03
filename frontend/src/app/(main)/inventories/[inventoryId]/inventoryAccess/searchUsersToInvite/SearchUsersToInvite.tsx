'use client';

import { Typography, Skeleton } from 'antd';
import { InputField } from '@/components/inputField/InputField';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { canModifyInventory } from '@/helpers/canModifyInventory';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { useCallback, useEffect, useState } from 'react';
import { User } from '@/interfaces/users/User';
import { InviteUserItem } from './inviteUserItem/InviteUserItem';
import { Inventory } from '@/interfaces/inventories/Inventory';
import './searchUsersToInvite.css';
import api from '../../../../../../../axiosConfig';
import { InventoryInviteStatuses } from '@/interfaces/inventories/InventoryInvite';

const { Title } = Typography;

interface Props {
  currentInventoryUser: InventoryUser | null;
  inventory: Inventory | null;
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>;
}

export const SearchUsersToInvite = ({ currentInventoryUser, inventory, setInventory }: Props) => {
  const { user } = useAuth();
  const t = useTranslations();

  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const getUsers = useCallback(async () => {
    if (!canModifyInventory(currentInventoryUser, user) || !name.trim() || !inventory?.id) return;
    setLoading(true);

    try {
      const { data } = await api.get(`/users/to-invite/${inventory?.id}`, { params: { name } });
      setUsers(data);
    } catch {
      setError(t('inventory.access.search_users_error'));
    } finally {
      setLoading(false);
    }
  }, [user, currentInventoryUser, name, inventory?.id, t]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const nameOnChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setName(value);

    if (!value.trim()) setUsers([]);
  };

  return (
    <div className='search_users_to_invite'>
      <div className='search_users_top'>
        <Title level={3} style={{ margin: '0px 0px 20px 0px' }}>
          {t('inventory.access.search')}
        </Title>
        <InputField value={name} onChange={nameOnChangeHandler} placeHolder={t('inventory.access.search_users_placeholder')} />
      </div>
      <hr />

      <ul className='search_users_list'>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className='invite_user_item_skeleton'>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Skeleton.Avatar active size={48} style={{ backgroundColor: 'var(--hover-color)' }} />
                <Skeleton.Input active style={{ width: 100, backgroundColor: 'var(--hover-color)' }} />
              </div>
              <Skeleton.Button active size='small' style={{ width: 80, borderRadius: 4, backgroundColor: 'var(--hover-color)' }} />
            </li>
          ))
        ) : error ? (
          <Title level={4} style={{ color: 'var(--red-color)', margin: 0, textAlign: 'center' }}>
            {error}
          </Title>
        ) : (
          users.map((u) => {
            const isParticipantOrInvited = !!(
              inventory?.inventoryUsers?.some((iu) => iu.userId === u.id) ||
              inventory?.invites?.some((inv) => inv.inviteeUserId === u.id && inv.status === InventoryInviteStatuses.PENDING)
            );
            return (
              <InviteUserItem
                key={`${u.id}-${inventory?.invites?.length}`}
                currentInventoryUser={currentInventoryUser}
                inventory={inventory}
                setInventory={setInventory}
                user={u}
                disabled={isParticipantOrInvited}
              />
            );
          })
        )}
      </ul>
    </div>
  );
};
