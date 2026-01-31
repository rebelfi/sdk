import { AxiosInstance } from 'axios';
import { Venue, VenueListResponse, VenueQuery } from '../types.js';
import { unwrapResponse } from '../client.js';

export class VenuesAPI {
  constructor(private readonly client: AxiosInstance) {}

  /**
   * List all available venues
   * @param query Optional filters for blockchain and token
   */
  async list(query?: VenueQuery): Promise<VenueListResponse> {
    const response = await this.client.get('/v1/venues', { params: query });
    return unwrapResponse(response);
  }

  /**
   * Get details for a specific venue
   * @param id Venue ID
   */
  async get(id: number): Promise<Venue> {
    const response = await this.client.get(`/v1/venues/${id}`);
    return unwrapResponse(response);
  }
}
