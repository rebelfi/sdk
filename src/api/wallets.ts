import { AxiosInstance } from 'axios';
import {
  RegisterWalletRequest,
  WalletResponse,
  WalletListResponse,
  WalletListQuery,
  UpdateWalletRequest,
  WalletChallengeRequest,
  WalletChallengeResponse,
  WalletProof,
  VerifyWalletResponse
} from '../types.js';
import { unwrapResponse } from '../client.js';

export class WalletsAPI {
  constructor(
    private readonly client: AxiosInstance,
    private readonly prefix: string
  ) {}

  /**
   * Register a wallet (idempotent — re-registering returns the existing wallet).
   * Pass `proof` (from `challenge()`, signed by the wallet) to register it controlled.
   */
  async register(request: RegisterWalletRequest): Promise<WalletResponse> {
    const response = await this.client.post(`${this.prefix}/wallets/register`, request);
    return unwrapResponse(response);
  }

  /**
   * Request a one-time ownership challenge for a wallet address. Sign `message` with the wallet and pass
   * `{ challengeId, signature }` to `register({ proof })` or `verify()` before `expiresAt`.
   */
  async challenge(request: WalletChallengeRequest): Promise<WalletChallengeResponse> {
    const response = await this.client.post(`${this.prefix}/wallets/challenge`, request);
    return unwrapResponse(response);
  }

  /**
   * Prove control of a registered wallet with a signed challenge. A watch-only or legacy wallet becomes controlled.
   */
  async verify(walletId: number, proof: WalletProof): Promise<VerifyWalletResponse> {
    const response = await this.client.post(`${this.prefix}/wallets/${walletId}/verify`, proof);
    return unwrapResponse(response);
  }

  /**
   * List wallets for the organization
   */
  async list(query?: WalletListQuery): Promise<WalletListResponse> {
    const response = await this.client.get(`${this.prefix}/wallets`, { params: query });
    return unwrapResponse(response);
  }

  /**
   * Get a wallet by ID
   */
  async get(walletId: number): Promise<WalletResponse> {
    const response = await this.client.get(`${this.prefix}/wallets/${walletId}`);
    return unwrapResponse(response);
  }

  /**
   * Update wallet metadata
   */
  async update(walletId: number, request: UpdateWalletRequest): Promise<WalletResponse> {
    const response = await this.client.patch(`${this.prefix}/wallets/${walletId}`, request);
    return unwrapResponse(response);
  }
}
