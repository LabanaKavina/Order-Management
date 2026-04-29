import type { IMenuRepository } from '@/domain/interfaces/menu/IMenuRepository';
import type { IMenuService } from '@/domain/interfaces/menu/IMenuService';
import type { MenuItem } from '@/domain/models/types';

export class MenuService implements IMenuService {
  private readonly repository: IMenuRepository;

  constructor(repository: IMenuRepository) {
    this.repository = repository;
  }

  async getMenu(): Promise<MenuItem[]> {
    const items = await this.repository.getMenu();
    if (!Array.isArray(items)) {
      throw new Error('Invalid menu response from server');
    }
    return items;
  }
}
