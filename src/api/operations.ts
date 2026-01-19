import { AxiosInstance } from 'axios';
import { SupplyRequest, UnwindRequest, OperationResponse } from '../types.js';
import { unwrapResponse } from '../client.js';

export class OperationsAPI {
  constructor(private readonly client: AxiosInstance) {}

  /**
   * Plan a supply operation and get unsigned transactions
   * @param request Supply parameters
   * @returns Operation with unsigned transactions to sign
   */
  async supply(request: SupplyRequest): Promise<OperationResponse> {
    const response = await this.client.post('/v1/operations/supply', request);
    return unwrapResponse(response);
  }

  /**
   * Plan an unwind operation and get unsigned transactions
   * @param request Unwind parameters
   * @returns Operation with unsigned transactions to sign
   */
  async unwind(request: UnwindRequest): Promise<OperationResponse> {
    const response = await this.client.post('/v1/operations/unwind', request);
    return unwrapResponse(response);
  }

  /**
   * Get operation details and current status
   * @param id Operation ID
   */
  async get(id: number): Promise<OperationResponse> {
    const response = await this.client.get(`/v1/operations/${id}`);
    return unwrapResponse(response);
  }
}
