import { AxiosInstance } from 'axios';
import { SupplyRequest, UnwindRequest, OperationResponse, CancelOperationResponse, UnsignedTransactionDetail } from '../types.js';
import { unwrapResponse } from '../client.js';

export class OperationsAPI {
  constructor(
    private readonly client: AxiosInstance,
    private readonly prefix: string
  ) {}

  /**
   * Plan a supply operation and get unsigned transactions
   * @param request Supply parameters
   * @returns Operation with unsigned transactions to sign
   */
  async supply(request: SupplyRequest): Promise<OperationResponse> {
    const response = await this.client.post(`${this.prefix}/operations/supply`, request);
    return unwrapResponse(response);
  }

  /**
   * Plan an unwind operation and get unsigned transactions
   * @param request Unwind parameters
   * @returns Operation with unsigned transactions to sign
   */
  async unwind(request: UnwindRequest): Promise<OperationResponse> {
    const response = await this.client.post(`${this.prefix}/operations/unwind`, request);
    return unwrapResponse(response);
  }

  /**
   * Get operation details and current status
   * @param id Operation ID
   */
  async get(id: number): Promise<OperationResponse> {
    const response = await this.client.get(`${this.prefix}/operations/${id}`);
    return unwrapResponse(response);
  }

  /**
   * Cancel a pending operation
   * @param id Operation ID to cancel
   */
  async cancel(id: number): Promise<CancelOperationResponse> {
    const response = await this.client.post(`${this.prefix}/operations/${id}/cancel`);
    return unwrapResponse(response);
  }

  /**
   * Get fresh unsigned transactions for signing.
   * Refreshes stale transactions with current gas pricing/nonce (EVM) or fresh blockhash (Solana).
   * Call this before signing to ensure transactions are up-to-date.
   * @param id Operation ID
   */
  async getUnsignedTransactions(id: number): Promise<UnsignedTransactionDetail[]> {
    const response = await this.client.get(`${this.prefix}/operations/${id}/unsigned-transactions`);
    return unwrapResponse(response);
  }
}
