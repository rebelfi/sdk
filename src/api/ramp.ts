import { AxiosInstance } from 'axios';
import { unwrapResponse } from '../client.js';
import type {
  RampKybStatusResponse,
  CreateRampOnrampAccountRequest,
  RampOnrampAccountResponse,
  RampTransactionResponse,
  RampTransactionListResponse,
  RampSummaryResponse,
  RampExportParams,
  CreateRampOfframpAccountRequest,
  RampOfframpAccountResponse,
  RampOfframpStatusResponse
} from '../types.js';

export class RampAPI {
  constructor(
    private readonly client: AxiosInstance,
    private readonly prefix: string
  ) {}

  async getKybStatus(): Promise<RampKybStatusResponse> {
    const response = await this.client.get(`${this.prefix}/ramp/org/kyb/status`);
    return unwrapResponse(response);
  }

  async startKyb(): Promise<{ kybUrl: string; status: string }> {
    const response = await this.client.post(`${this.prefix}/ramp/org/kyb/start`);
    return unwrapResponse(response);
  }

  async createOnrampAccount(params: CreateRampOnrampAccountRequest): Promise<RampOnrampAccountResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/org/onramp-accounts`, params);
    return unwrapResponse(response);
  }

  async getOnrampAccount(): Promise<RampOnrampAccountResponse | null> {
    const response = await this.client.get(`${this.prefix}/ramp/org/onramp-account`);
    return unwrapResponse(response);
  }

  async listTransactions(params?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    perPage?: number;
  }): Promise<RampTransactionListResponse> {
    const response = await this.client.get(`${this.prefix}/ramp/org/transactions`, { params });
    return unwrapResponse(response);
  }

  async getTransaction(id: number): Promise<RampTransactionResponse> {
    const response = await this.client.get(`${this.prefix}/ramp/org/transactions/${id}`);
    return unwrapResponse(response);
  }

  async getSummary(params?: { dateFrom?: string; dateTo?: string }): Promise<RampSummaryResponse> {
    const response = await this.client.get(`${this.prefix}/ramp/org/ramp-summary`, { params });
    return unwrapResponse(response);
  }

  async exportTransactions(params?: RampExportParams): Promise<string> {
    const response = await this.client.get(`${this.prefix}/ramp/org/transactions/export`, {
      params: { format: 'csv', ...params },
      responseType: 'text'
    });
    return response.data;
  }

  // ── Offramp ──

  async createOfframpAccount(params: CreateRampOfframpAccountRequest): Promise<RampOfframpAccountResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/org/offramp-accounts`, {
      org_wallet_id: params.orgWalletId,
      source_asset: params.sourceAsset,
      rail: params.rail,
      bank_details: {
        routing_number: params.bankDetails.routingNumber,
        account_number: params.bankDetails.accountNumber,
        account_type: params.bankDetails.accountType,
        account_holder_name: params.bankDetails.accountHolderName,
        bank_name: params.bankDetails.bankName
      }
    });
    return unwrapResponse(response);
  }

  async listOfframpAccounts(): Promise<RampOfframpAccountResponse[]> {
    const response = await this.client.get(`${this.prefix}/ramp/org/offramp-accounts`);
    return unwrapResponse(response);
  }

  async getOfframpStatus(): Promise<RampOfframpStatusResponse> {
    const response = await this.client.get(`${this.prefix}/ramp/org/offramp-status`);
    return unwrapResponse(response);
  }

  async listOfframpTransactions(params?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    perPage?: number;
  }): Promise<RampTransactionListResponse> {
    const response = await this.client.get(`${this.prefix}/ramp/org/offramp-transactions`, { params });
    return unwrapResponse(response);
  }

  async getOfframpTransaction(id: number): Promise<RampTransactionResponse> {
    const response = await this.client.get(`${this.prefix}/ramp/org/offramp-transactions/${id}`);
    return unwrapResponse(response);
  }

  async exportOfframpTransactions(params?: RampExportParams): Promise<string> {
    const response = await this.client.get(`${this.prefix}/ramp/org/offramp-transactions/export`, {
      params: { format: 'csv', ...params },
      responseType: 'text'
    });
    return response.data;
  }
}
