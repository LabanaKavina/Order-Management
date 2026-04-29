import type { MenuItem } from '@/domain/models/types';

export interface IMenuRepository {
  getMenu(): Promise<MenuItem[]>;
}
