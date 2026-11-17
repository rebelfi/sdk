import { AxiosInstance } from 'axios';
import { ApyHistoryQuery, ApyHistoryResponse, Venue, VenueListResponse, VenueQuery } from '../types.js';
import { unwrapResponse } from '../client.js';

export class VenuesAPI {
  constructor(
    private readonly client: AxiosInstance,
    private readonly prefix: string
  ) {}

  /**
   * List all available venues
   * @param query Optional filters for blockchain and token
   */
  async list(query?: VenueQuery): Promise<VenueListResponse> {
    const response = await this.client.get(`${this.prefix}/venues`, { params: query });
    return unwrapResponse(response);
  }

  /**
   * Get details for a specific venue
   * @param id Venue ID
   */
  async get(id: number): Promise<Venue> {
    const response = await this.client.get(`${this.prefix}/venues/${id}`);
    return unwrapResponse(response);
  }

  /**
   * Get a strategy's daily APY history, before and after the yield share
   * @param strategyId Strategy ID
   * @param query Optional days (1-90, default 30) and at most one wallet selector
   */
  async apyHistory(strategyId: number, query?: ApyHistoryQuery): Promise<ApyHistoryResponse> {
    const response = await this.client.get(`${this.prefix}/venues/strategies/${strategyId}/apy-history`, { params: query });
    return unwrapResponse(response);
  }
}
