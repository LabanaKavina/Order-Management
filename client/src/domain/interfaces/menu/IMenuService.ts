import type { MenuItem } from '@/domain/models/types';

export interface IMenuService {
  getMenu(): Promise<MenuItem[]>;
}
