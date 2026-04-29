import type { IMenuRepository } from '@/domain/interfaces/menu/IMenuRepository';
import type { MenuItem } from '@/domain/models/types';
import type { IHttpClient } from '@/infrastructure/utils/http/types';
import { BaseRepository } from '../BaseRepository';

export class MenuRepository extends BaseRepository implements IMenuRepository {
  private readonly baseUrl = '/menu';

  constructor(httpClient: IHttpClient) {
    super(httpClient);
  }

  async getMenu(): Promise<MenuItem[]> {
    try {
      return await this.httpClient.get<MenuItem[]>(this.baseUrl);
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
