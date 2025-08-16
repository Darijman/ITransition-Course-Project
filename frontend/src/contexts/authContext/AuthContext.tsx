'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { BasicUser } from '@/interfaces/BasicUser';
import { UserRoles } from '@/interfaces/UserRoles.enum';
import api from '../../../axiosConfig';

interface AuthContextType {
  user: BasicUser;
  setUser: (user: BasicUser) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<BasicUser>({
    id: 0,
    name: '',
    role: UserRoles.USER,
    avatarUrl: '',
  });

  const getUser = async () => {
    try {
      const response = await api.get<BasicUser>('/auth/profile');
      console.log(`response`, response);
      
      setUser(response.data);
    } catch (error: any) {
      console.log(`error`, error);
      
      setUser({ id: 0, name: '', role: UserRoles.USER, avatarUrl: '' });
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
