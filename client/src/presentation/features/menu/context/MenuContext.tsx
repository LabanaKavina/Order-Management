import React, { createContext, useContext, useState, useMemo } from 'react';
import type { IMenuService } from '@/domain/interfaces/menu/IMenuService';
import type { MenuItem } from '@/domain/models/types';
import { MenuRepository } from '@/infrastructure/api/menu/MenuRepository';
import { createHttpClient } from '@/infrastructure/utils/http/httpClientFactory';
import { MenuService } from '@/application/features/menu/MenuService';

interface MenuContextType {
  menuService: IMenuService;
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  setMenuItems: (items: MenuItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const menuService = useMemo(() => {
    const httpClient = createHttpClient();
    const menuRepository = new MenuRepository(httpClient);
    return new MenuService(menuRepository);
  }, []);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <MenuContext.Provider value={{ menuService, menuItems, loading, error, setMenuItems, setLoading, setError }}>
      {children}
    </MenuContext.Provider>
  );
};

export function useMenuContext(): MenuContextType {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenuContext must be used within MenuProvider');
  return context;
}
