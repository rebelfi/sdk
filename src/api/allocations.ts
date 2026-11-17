import { AxiosInstance } from 'axios';
import {
  Allocation,
  AllocationListResponse,
  AllocationQuery,
  AllocationListRequest,
  EarningsQuery,
  EarningsResponse,
  OrgOverview,
  OrgOverviewAll
} from '../types.js';
import { unwrapResponse } from '../client.js';

export class AllocationsAPI {
  constructor(
    private readonly client: AxiosInstance,
    private readonly prefix: string
  ) {}

  /**
   * List all allocations for a wallet.
   * Accepts AllocationListRequest (POST, supports walletId/userId) or
   * legacy AllocationQuery (GET, walletAddress only).
   */
  async list(query: AllocationListRequest | AllocationQuery): Promise<AllocationListResponse> {
    // If it has walletId or userId, use the new POST endpoint
    if ('walletId' in query || 'userId' in query) {
      const response = await this.client.post(`${this.prefix}/allocations`, query);
      return unwrapResponse(response);
    }
    // Legacy: use POST with walletAddress
    const response = await this.client.post(`${this.prefix}/allocations`, query);
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
    const response = await this.client.get(`${this.prefix}/allocations/strategy/${strategyId}`, { params });
    return unwrapResponse(response);
  }

  /**
   * @deprecated Use get(strategyId, wallet) instead
   */
  async getByVenue(venueId: number, walletAddress: string): Promise<Allocation> {
    const response = await this.client.get(`${this.prefix}/allocations/${venueId}`, {
      params: { walletAddress }
    });
    return unwrapResponse(response);
  }

  /**
   * Get earnings history for a wallet with daily granularity
   */
  async earnings(query: EarningsQuery): Promise<EarningsResponse> {
    const response = await this.client.get(`${this.prefix}/allocations/earnings`, { params: query });
    return unwrapResponse(response);
  }

  /**
   * Get org-level overview of all wallet allocations.
   * Returns aggregate metrics: total value, yield, APY, and distributions
   * by protocol, asset, and blockchain.
   * Scoped to the wallet profile associated with the API key.
   */
  async overview(): Promise<OrgOverview> {
    const response = await this.client.get(`${this.prefix}/allocations/overview`);
    return unwrapResponse(response);
  }

  /**
   * Get aggregate overview across all wallet profiles.
   * Requires an admin API key (read-only, not scoped to a wallet profile).
   * Returns per-profile breakdown and org-wide totals.
   * @param walletProfileId Optional filter to get overview for a specific profile
   */
  async overviewAll(walletProfileId?: number): Promise<OrgOverviewAll> {
    const params = walletProfileId ? { walletProfileId } : undefined;
    const response = await this.client.get(`${this.prefix}/allocations/overview/all`, { params });
    return unwrapResponse(response);
  }
}
