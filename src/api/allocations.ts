import { AxiosInstance } from 'axios';
import {
  Allocation,
  AllocationListResponse,
  AllocationQuery,
  EarningsQuery,
  EarningsResponse
} from '../types.js';
import { unwrapResponse } from '../client.js';

export class AllocationsAPI {
  constructor(private readonly client: AxiosInstance) {}

  /**
   * List all allocations for a wallet
   * @param query Query with walletAddress and optional blockchain filter
   */
  async list(query: AllocationQuery): Promise<AllocationListResponse> {
    const response = await this.client.get('/v1/allocations', { params: query });
    return unwrapResponse(response);
  }

  /**
   * Get allocation at a specific venue
   * @param venueId Venue ID
   * @param walletAddress User wallet address
   */
  async get(venueId: number, walletAddress: string): Promise<Allocation> {
    const response = await this.client.get(`/v1/allocations/${venueId}`, {
      params: { walletAddress }
    });
    return unwrapResponse(response);
  }

  /**
   * Get earnings history for a wallet with daily granularity
   *
   * @param query Query with walletAddress, blockchain, token, and optional days/includeBreakdown
   * @returns Historical earnings data with daily entries and optional per-venue breakdown
   *
   * @example
   * ```typescript
   * const earnings = await client.allocations.earnings({
   *   walletAddress: 'So11...abc',
   *   blockchain: 'solana',
   *   token: 'USDC',
   *   days: 30,
   *   includeBreakdown: true
   * });
   *
   * console.log(`Total yield: ${earnings.totalYieldEarned}`);
   * for (const day of earnings.history) {
   *   console.log(`${day.date}: ${day.yieldEarned}`);
   * }
   * ```
   */
  async earnings(query: EarningsQuery): Promise<EarningsResponse> {
    const response = await this.client.get('/v1/allocations/earnings', { params: query });
    return unwrapResponse(response);
  }
}
