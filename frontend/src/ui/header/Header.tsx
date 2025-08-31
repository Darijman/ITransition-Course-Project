'use client';

import { Typography, MenuProps, Dropdown, Button, Badge } from 'antd';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { SwitchTheme } from './switchThemes/SwitchTheme';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { IoLanguageOutline } from 'react-icons/io5';
import { DeleteModal } from '@/components/deleteModal/DeleteModal';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { useLocale } from '@/contexts/localeContext/LocaleContext';
import { MdBackpack } from 'react-icons/md';
import { HeaderAvatar } from './headerAvatar/HeaderAvatar';
import api from '../../../axiosConfig';
import './header.css';
import './responsive.css';
import { useNotifications } from '@/contexts/notificationContext/NotificationContext';

const { Title } = Typography;

export const Header = () => {
  const { user } = useAuth();
  const { unreadCounts } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations();
  const { locale, switchLocale } = useLocale();

  const [mounted, setMounted] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [logoutErrorText, setLogoutErrorText] = useState<string>('');
  const [isLoggingOut, setIsloggingOut] = useState<boolean>(false);

  const items: MenuProps['items'] = [
    ...(user.id
      ? [
          {
            key: 'profile',
            icon: <UserOutlined style={{ fontSize: 20 }} />,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {t('header.profile')}
                {unreadCounts.TOTAL > 0 && <Badge count={unreadCounts.TOTAL} />}
              </div>
            ),
            style: pathname === '/profile' ? { fontWeight: 'bold', backgroundColor: 'var(--background-color)' } : {},
            onClick: () => router.push('/profile'),
          },
          {
            key: 'inventoryNew',
            icon: <MdBackpack style={{ fontSize: 20 }} />,
            label: t('header.new_inventory'),
            style: pathname === '/inventories/new' ? { fontWeight: 'bold', backgroundColor: 'var(--background-color)' } : {},
            onClick: () => router.push('/inventories/new'),
          },
          { type: 'divider' as const },
        ]
      : []),
    {
      key: 'language',
      icon: <IoLanguageOutline style={{ fontSize: 20 }} />,
      label: t('header.language'),
      popupOffset: [5, 0],
      children: [
        {
          key: 'en',
          label: t('header.lang_en'),
          onClick: () => switchLocale('en'),
          style: locale === 'en' ? { fontWeight: 'bold', backgroundColor: 'var(--background-color)' } : {},
        },
        {
          key: 'ru',
          label: t('header.lang_ru'),
          onClick: () => switchLocale('ru'),
          style: locale === 'ru' ? { fontWeight: 'bold', backgroundColor: 'var(--background-color)' } : {},
        },
      ],
    },
    ...(user.id
      ? [
          {
            key: 'signout',
            icon: <LogoutOutlined style={{ fontSize: 20 }} />,
            label: t('header.sign_out'),
            onClick: () => setShowLogoutModal(true),
          },
        ]
      : []),
  ];

  const logoutHandler = async () => {
    if (!user.id) return;
    setIsloggingOut(true);

    try {
      await api.post(`/auth/logout`);
      router.push('/auth/login');
    } catch {
      setLogoutErrorText('Something went wrong..');
    } finally {
      setIsloggingOut(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className='header'>
      <div className='header_inner'>
        <div className='top_row'>
          <div className='left'>
            <Title level={5} onClick={() => router.push('/')} className='header_title'>
              {t('header.home')}
            </Title>
          </div>

          <div className='right'>
            {!user?.id && (
              <div className='auth_buttons_inline'>
                <Button onClick={() => router.push('/auth/login')} type='text'>
                  {t('header.sign_in_text')}
                </Button>
                <Button onClick={() => router.push('/auth/register')} type='primary'>
                  {t('header.sign_up_text')}
                </Button>
              </div>
            )}

            <SwitchTheme />
            <Dropdown
              overlayClassName={`custom_dropdown ${locale === 'en' ? 'lang-en' : ''}`}
              menu={{ items }}
              placement='bottomRight'
              arrow
              trigger={['click']}
            >
              <span style={{ cursor: 'pointer', display: 'inline-block' }}>
                <HeaderAvatar />
              </span>
            </Dropdown>
          </div>
        </div>

        {!user?.id && (
          <div className='bottom_row'>
            <div className='auth_buttons_mobile'>
              <Button onClick={() => router.push('/auth/login')} type='text'>
                {t('header.sign_in_text')}
              </Button>
              <Button onClick={() => router.push('/auth/register')} type='primary'>
                {t('header.sign_up_text')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onDelete={logoutHandler}
        title={t('header.sign_out') + '?'}
        text={t('delete_modal.logout_text')}
        deleteButtonText={t('delete_modal.confirm_logout_text')}
        cancelButtonText={t('delete_modal.cancel_logout_text')}
        errorMessage={logoutErrorText}
        isDeleting={isLoggingOut}
      />
    </header>
  );
};
