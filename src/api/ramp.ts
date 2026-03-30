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
  RampOfframpStatusResponse,
  SimulateTransactionRequest,
  SimulateOfframpTransactionRequest,
  SimulationResponse,
  CreateRecipientRequest,
  RecipientResponse,
  RecipientListResponse,
  CreateRecipientOnrampAccountRequest,
  CreateRecipientOfframpAccountRequest
} from '../types.ts';

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

  // ── Simulation ──

  async simulateKybApproval(): Promise<RampKybStatusResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/org/kyb/simulate-approve`);
    return unwrapResponse(response);
  }

  async simulateKybRejection(): Promise<RampKybStatusResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/org/kyb/simulate-reject`);
    return unwrapResponse(response);
  }

  async simulateOnrampTransaction(params?: SimulateTransactionRequest): Promise<SimulationResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/org/simulate-transaction`, {
      scenario: params?.scenario,
      usd_amount: params?.usdAmount,
      onramp_account_id: params?.onrampAccountId,
    });
    return response.data;
  }

  async simulateOfframpTransaction(params?: SimulateOfframpTransactionRequest): Promise<SimulationResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/org/simulate-offramp-transaction`, {
      scenario: params?.scenario,
      usd_amount: params?.usdAmount,
      offramp_account_id: params?.offrampAccountId,
    });
    return response.data;
  }

  // ── KYB (additional) ──

  async checkKybStatus(): Promise<RampKybStatusResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/org/kyb/check-status`);
    return unwrapResponse(response);
  }

  // ── Recipients ──

  async createRecipient(params: CreateRecipientRequest): Promise<RecipientResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/recipients`, {
      name: params.name,
      type: params.type,
      external_id: params.externalId,
      address: params.address ? {
        street1: params.address.street1,
        street2: params.address.street2,
        city: params.address.city,
        region: params.address.region,
        postal_code: params.address.postalCode,
        country: params.address.country,
      } : undefined,
    });
    return unwrapResponse(response);
  }

  async listRecipients(params?: { page?: number; perPage?: number }): Promise<RecipientListResponse> {
    const response = await this.client.get(`${this.prefix}/ramp/recipients`, {
      params: params ? { page: params.page, per_page: params.perPage } : undefined,
    });
    return unwrapResponse(response);
  }

  async getRecipient(id: number): Promise<RecipientResponse> {
    const response = await this.client.get(`${this.prefix}/ramp/recipients/${id}`);
    return unwrapResponse(response);
  }

  async archiveRecipient(id: number): Promise<RecipientResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/recipients/${id}/archive`);
    return unwrapResponse(response);
  }

  async createRecipientOnrampAccount(recipientId: number, params: CreateRecipientOnrampAccountRequest): Promise<RampOnrampAccountResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/recipients/${recipientId}/onramp-accounts`, {
      destination_wallet_id: params.destinationWalletId,
      source_asset: params.sourceAsset,
      destination_asset: params.destinationAsset,
      rail: params.rail,
    });
    return unwrapResponse(response);
  }

  async createRecipientOfframpAccount(recipientId: number, params: CreateRecipientOfframpAccountRequest): Promise<RampOfframpAccountResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/recipients/${recipientId}/offramp-accounts`, {
      org_wallet_id: params.orgWalletId,
      source_asset: params.sourceAsset,
      rail: params.rail,
      bank_details: {
        routing_number: params.bankDetails.routingNumber,
        account_number: params.bankDetails.accountNumber,
        account_type: params.bankDetails.accountType,
        account_holder_name: params.bankDetails.accountHolderName,
        bank_name: params.bankDetails.bankName,
      },
    });
    return unwrapResponse(response);
  }

  async listRecipientOfframpAccounts(recipientId: number): Promise<RampOfframpAccountResponse[]> {
    const response = await this.client.get(`${this.prefix}/ramp/recipients/${recipientId}/offramp-accounts`);
    return unwrapResponse(response);
  }

  async simulateRecipientOnrampTransaction(recipientId: number, params?: SimulateTransactionRequest): Promise<SimulationResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/recipients/${recipientId}/simulate-transaction`, {
      scenario: params?.scenario,
      usd_amount: params?.usdAmount,
      onramp_account_id: params?.onrampAccountId,
    });
    return response.data;
  }

  async simulateRecipientOfframpTransaction(recipientId: number, params?: SimulateOfframpTransactionRequest): Promise<SimulationResponse> {
    const response = await this.client.post(`${this.prefix}/ramp/recipients/${recipientId}/simulate-offramp-transaction`, {
      scenario: params?.scenario,
      usd_amount: params?.usdAmount,
      offramp_account_id: params?.offrampAccountId,
    });
    return response.data;
  }
}
