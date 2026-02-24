import { AxiosInstance } from 'axios';
import {
  RegisterWalletRequest,
  WalletResponse,
  WalletListResponse,
  WalletListQuery,
  UpdateWalletRequest
} from '../types.js';
import { unwrapResponse } from '../client.js';

export class WalletsAPI {
  constructor(
    private readonly client: AxiosInstance,
    private readonly prefix: string
  ) {}

  /**
   * Register a wallet (idempotent — re-registering returns the existing wallet)
   */
  async register(request: RegisterWalletRequest): Promise<WalletResponse> {
    const response = await this.client.post(`${this.prefix}/wallets/register`, request);
    return unwrapResponse(response);
  }

  /**
   * List wallets for the organization
   */
  async list(query?: WalletListQuery): Promise<WalletListResponse> {
    const response = await this.client.get(`${this.prefix}/wallets`, { params: query });
    return unwrapResponse(response);
  }

  /**
   * Get a wallet by ID
   */
  async get(walletId: number): Promise<WalletResponse> {
    const response = await this.client.get(`${this.prefix}/wallets/${walletId}`);
    return unwrapResponse(response);
  }

  /**
   * Update wallet metadata
   */
  async update(walletId: number, request: UpdateWalletRequest): Promise<WalletResponse> {
    const response = await this.client.patch(`${this.prefix}/wallets/${walletId}`, request);
    return unwrapResponse(response);
  }
}
