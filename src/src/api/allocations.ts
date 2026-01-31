import { AxiosInstance } from 'axios';
import {
  Allocation,
  AllocationListResponse,
  AllocationQuery,
  AllocationListRequest,
  EarningsQuery,
  EarningsResponse
} from '../types.js';
import { unwrapResponse } from '../client.js';

export class AllocationsAPI {
  constructor(private readonly client: AxiosInstance) {}

  /**
   * List all allocations for a wallet.
   * Accepts AllocationListRequest (POST, supports walletId/userId) or
   * legacy AllocationQuery (GET, walletAddress only).
   */
  async list(query: AllocationListRequest | AllocationQuery): Promise<AllocationListResponse> {
    // If it has walletId or userId, use the new POST endpoint
    if ('walletId' in query || 'userId' in query) {
      const response = await this.client.post('/v1/allocations', query);
      return unwrapResponse(response);
    }
    // Legacy: use POST with walletAddress
    const response = await this.client.post('/v1/allocations', query);
    return unwrapResponse(response);
  }

  /**
   * Get allocation by strategy ID
   * @param strategyId Strategy ID
   * @param wallet Wallet address or wallet ID
   */
  async get(strategyId: number, wallet: string | number): Promise<Allocation> {
    const params = typeof wallet === 'string'
      ? { walletAddress: wallet }
      : { walletId: wallet };
    const response = await this.client.get(`/v1/allocations/strategy/${strategyId}`, { params });
    return unwrapResponse(response);
  }

  /**
   * @deprecated Use get(strategyId, wallet) instead
   */
  async getByVenue(venueId: number, walletAddress: string): Promise<Allocation> {
    const response = await this.client.get(`/v1/allocations/${venueId}`, {
      params: { walletAddress }
    });
    return unwrapResponse(response);
  }

  /**
   * Get earnings history for a wallet with daily granularity
   */
  async earnings(query: EarningsQuery): Promise<EarningsResponse> {
    const response = await this.client.get('/v1/allocations/earnings', { params: query });
    return unwrapResponse(response);
  }
}
