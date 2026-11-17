import { AxiosInstance } from 'axios';
import { WalletProfileListResponse } from '../types.js';
import { unwrapResponse } from '../client.js';

export class WalletProfilesAPI {
  constructor(
    private readonly client: AxiosInstance,
    private readonly prefix: string
  ) {}

  /**
   * List wallet profiles for the organization
   */
  async list(): Promise<WalletProfileListResponse> {
    const response = await this.client.get(`${this.prefix}/wallet-profiles`);
    return unwrapResponse(response);
  }
}
