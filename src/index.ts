import { AxiosInstance } from 'axios';
import { createHttpClient, getVersionPrefix } from './client.js';
import { VenuesAPI } from './api/venues.js';
import { AllocationsAPI } from './api/allocations.js';
import { OperationsAPI } from './api/operations.js';
import { TransactionsAPI } from './api/transactions.js';
import { WalletsAPI } from './api/wallets.js';
import { RampAPI } from './api/ramp.js';
import { WalletProfilesAPI } from './api/wallet-profiles.js';
import { RebelfiSDKConfig } from './types.js';

// Re-export all types
export * from './types.js';

/**
 * RebelFi Client for B2B2C yield integration
 *
 * @example
 * ```typescript
 * import { RebelfiClient } from '@rebelfi/sdk';
 *
 * // Production environment
 * const rebelfi = new RebelfiClient({ apiKey: process.env.REBELFI_API_KEY });
 *
 * // Sandbox environment
 * const rebelfiSandbox = new RebelfiClient({
 *   apiKey: process.env.REBELFI_SANDBOX_API_KEY,
 *   sandbox: true
 * });
 *
 * // List available venues with their strategies
 * const { venues } = await rebelfi.venues.list();
 *
 * // Find a strategy to use (venues contain strategies)
 * const venue = venues[0];
 * const strategy = venue.strategies[0];
 *
 * // Plan a supply operation using strategyId
 * const operation = await rebelfi.operations.supply({
 *   walletAddress: 'So11...abc',
 *   strategyId: strategy.strategyId,
 *   amount: '1000000', // 1 USDC in base units
 *   tokenAddress: strategy.tokenAddress
 * });
 *
 * // After user signs the transaction and broadcasts:
 * await rebelfi.transactions.submitHash({
 *   operationId: operation.operationId,
 *   txHash: '5abc...'
 * });
 * ```
 */
export class RebelfiClient {
  private readonly client: AxiosInstance;

  public readonly venues: VenuesAPI;
  public readonly allocations: AllocationsAPI;
  public readonly operations: OperationsAPI;
  public readonly transactions: TransactionsAPI;
  public readonly wallets: WalletsAPI;
  public readonly ramp: RampAPI;
  public readonly walletProfiles: WalletProfilesAPI;

  constructor(config: RebelfiSDKConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.client = createHttpClient(config);
    const prefix = getVersionPrefix(config);

    this.venues = new VenuesAPI(this.client, prefix);
    this.allocations = new AllocationsAPI(this.client, prefix);
    this.operations = new OperationsAPI(this.client, prefix);
    this.transactions = new TransactionsAPI(this.client, prefix);
    this.wallets = new WalletsAPI(this.client, prefix);
    this.ramp = new RampAPI(this.client, prefix);
    this.walletProfiles = new WalletProfilesAPI(this.client, prefix);
  }
}

// Default export for convenience
export default RebelfiClient;
