import { AxiosInstance } from 'axios';
import { SubmitHashRequest, SubmitSignedRequest, TransactionStatusResponse } from '../types.js';
import { unwrapResponse } from '../client.js';

export class TransactionsAPI {
  constructor(private readonly client: AxiosInstance) {}

  /**
   * Submit transaction hash after organization broadcasts
   * Use when the neobank broadcasts the signed transaction themselves
   * @param request Operation ID and transaction hash
   */
  async submitHash(request: SubmitHashRequest): Promise<TransactionStatusResponse> {
    const response = await this.client.post('/v1/transactions/submit-hash', request);
    return unwrapResponse(response);
  }

  /**
   * Submit signed transaction for RebelFi to broadcast
   * Use when the neobank wants RebelFi to broadcast the transaction
   * @param request Operation ID and signed transaction
   */
  async submitSigned(request: SubmitSignedRequest): Promise<TransactionStatusResponse> {
    const response = await this.client.post('/v1/transactions/submit-signed', request);
    return unwrapResponse(response);
  }

  /**
   * Get current transaction status
   * @param id Transaction ID
   */
  async get(id: number): Promise<TransactionStatusResponse> {
    const response = await this.client.get(`/v1/transactions/${id}`);
    return unwrapResponse(response);
  }
}
