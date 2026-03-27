// ============================================
// CONFIG
// ============================================

export interface RebelfiSDKConfig {
  apiKey: string;
  /** Set to true to use sandbox environment (sandbox-api.rebelfi.io) */
  sandbox?: boolean;
  /** Optional: Override base URL (e.g., for proxying) */
  baseUrl?: string;
  timeout?: number;
}

// ============================================
// COMMON TYPES
// ============================================

export enum Blockchain {
  SOLANA = 'solana',
  POLYGON = 'polygon',
  ETHEREUM = 'ethereum',
  BASE = 'base',
}

export enum VenueStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DEPRECATED = 'DEPRECATED',
}

export enum StrategyStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
}

export enum TransactionStatus {
  UNSIGNED = 'UNSIGNED',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export enum OperationType {
  SUPPLY = 'SUPPLY',
  UNWIND = 'UNWIND',
}

export enum OperationStatus {
  PENDING = 'PENDING',
  AWAITING_SIGNATURE = 'AWAITING_SIGNATURE',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

// ============================================
// API RESPONSE WRAPPER (DEPRECATED)
// ============================================

/**
 * @deprecated The API no longer uses envelope responses.
 * Data is returned directly from endpoints.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================
// VENUE & STRATEGY TYPES
// ============================================

/**
 * A yield strategy within a venue.
 * Use `strategyId` for supply/unwind operations.
 */
export interface Strategy {
  /** Strategy identifier - use this for supply/unwind operations */
  strategyId: number;
  /** Strategy display name */
  name: string;
  /** Token symbol (e.g., 'USDC') */
  token: string;
  /** Token contract address */
  tokenAddress: string;
  /** Current APY as decimal (e.g., 0.085 for 8.5%) */
  apy: number;
  /** Total value locked */
  tvl?: string;
  /** Minimum deposit amount in base units */
  minDeposit?: string;
  /** Maximum deposit amount in base units */
  maxDeposit?: string;
  /** Strategy status */
  status: StrategyStatus;
  /** Whether this strategy supports gas-sponsored (zero-SOL) wallets */
  supportsGasSponsorship: boolean;
}

/**
 * A protocol/venue that contains one or more yield strategies.
 */
export interface Venue {
  /** Venue identifier */
  id: number;
  /** Venue display name (e.g., 'Kamino') */
  name: string;
  /** Protocol identifier (e.g., 'kamino') */
  protocol: string;
  /** Blockchain network */
  blockchain: Blockchain;
  /** Venue icon URL */
  iconUrl?: string;
  /** Venue status */
  status: VenueStatus;
  /** Available strategies at this venue */
  strategies: Strategy[];
}

export interface VenueListResponse {
  venues: Venue[];
  /** Number of venues */
  count: number;
  /** Total number of strategies across all venues */
  strategyCount: number;
}

export interface VenueQuery {
  blockchain?: Blockchain | `${Blockchain}`;
  token?: string;
  /** When true, only returns strategies compatible with gas-sponsored wallets */
  supportsGasSponsorship?: boolean;
}

// ============================================
// ALLOCATION TYPES
// ============================================

export interface Allocation {
  /** Strategy identifier - use this for unwind operations */
  strategyId: number;
  /** Strategy display name */
  strategyName: string;
  /** Venue identifier */
  venueId: number;
  /** Venue display name */
  venueName: string;
  /** User wallet address */
  walletAddress: string;
  /** Blockchain network */
  blockchain: Blockchain;
  /** Token symbol */
  token: string;
  /** Token contract address */
  tokenAddress: string;
  /** Principal amount deposited in base units */
  principal: string;
  /** Current value including yield in base units */
  currentValue: string;
  /** Total yield earned in base units */
  yieldEarned: string;
  /** Current APY as decimal */
  apy: number;
  /** Last update timestamp (ISO 8601) */
  lastUpdated: string;
}

export interface AllocationListResponse {
  allocations: Allocation[];
  totalValue: string;
  totalYieldEarned: string;
}

/** @deprecated Use AllocationListRequest instead */
export interface AllocationQuery {
  walletAddress: string;
  blockchain?: Blockchain | `${Blockchain}`;
}

export interface AllocationListRequest {
  walletAddress?: string;
  walletId?: number;
  userId?: string;
  blockchain?: Blockchain | `${Blockchain}`;
  page?: number;
  limit?: number;
}

// ============================================
// EARNINGS TYPES
// ============================================

export interface EarningsQuery {
  walletAddress?: string;
  walletId?: number;
  userId?: string;
  blockchain: Blockchain | `${Blockchain}`;
  token: string;
  days?: number;
  includeBreakdown?: boolean;
}

export interface EarningsDay {
  /** Date (YYYY-MM-DD) */
  date: string;
  /** Yield earned on this day (base units, can be negative) */
  yieldEarned: string;
  /** Yield earned in USD */
  yieldEarnedUsd: string;
  /** Cumulative yield from first activity (base units) */
  cumulativeYield: string;
  /** Closing position value (base units) */
  positionValue: string;
}

export interface VenueEarningsDay {
  /** Date (YYYY-MM-DD) */
  date: string;
  /** Yield earned on this day (base units) */
  yieldEarned: string;
  /** Yield earned in USD */
  yieldEarnedUsd: string;
}

export interface VenueEarnings {
  /** Venue identifier */
  venueId: number;
  /** Venue display name */
  venueName: string;
  /** Total yield earned at this venue (base units) */
  totalYieldEarned: string;
  /** Total yield earned in USD */
  totalYieldEarnedUsd: string;
  /** Daily earnings history for this venue */
  history: VenueEarningsDay[];
}

export interface EarningsResponse {
  walletAddress: string;
  blockchain: string;
  token: string;
  /** Start of requested period (YYYY-MM-DD) */
  periodStart: string;
  /** End of requested period (YYYY-MM-DD) */
  periodEnd: string;
  /** First date with data (null if never active) */
  firstActivityDate: string | null;
  /** Total yield earned in period (base units) */
  totalYieldEarned: string;
  /** Total yield earned in USD */
  totalYieldEarnedUsd: string;
  /** Daily earnings history (sparse - only dates with data) */
  history: EarningsDay[];
  /** Per-venue breakdown (only if includeBreakdown=true) */
  byVenue?: VenueEarnings[];
}

// ============================================
// TRANSACTION TYPES
// ============================================

export interface Transaction {
  id: number;
  blockchain: Blockchain;
  status: TransactionStatus;
  unsignedTransaction?: string;
  description?: string;
  txHash?: string;
  confirmations?: number;
  blockNumber?: number;
  error?: string;
  /** Machine-readable failure code when status is 'failed' */
  failureCode?: TransactionFailureCode;
  /** Smart contract revert reason if available */
  revertReason?: string;
}

// ============================================
// OPERATION TYPES
// ============================================

export interface SupplyRequest {
  walletAddress?: string;
  walletId?: number;
  strategyId: number;
  amount: string;
  tokenAddress: string;
}

export interface UnwindRequest {
  walletAddress?: string;
  walletId?: number;
  strategyId: number;
  /** Amount to unwind in base units. Required unless `fullWithdrawal` is true. */
  amount?: string;
  /** If true, withdraws the full position using the protocol's native max-withdrawal mechanism. Cannot be combined with `amount`. */
  fullWithdrawal?: boolean;
}

export interface OperationResponse {
  operationId: number;
  type: OperationType;
  status: OperationStatus;
  transactions: Transaction[];
  expiresAt: string;
  /** IDs of operations that were auto-cancelled when this operation was created */
  cancelledOperations?: number[];
}

// ============================================
// UNSIGNED TRANSACTION TYPES
// ============================================

/**
 * EVM-specific transaction fields.
 * Use these when your wallet builds transactions from components
 * rather than deserializing the serialized transaction.
 */
export interface EvmTransactionFields {
  /** Contract or recipient address */
  to: string;
  /** Encoded call data (hex string) */
  data: string;
  /** Native token value in wei (usually '0' for token operations) */
  value?: string;
  /** Gas limit */
  gasLimit?: string;
  /** Gas price in wei (legacy transactions) */
  gasPrice?: string;
  /** EIP-1559 max fee per gas */
  maxFeePerGas?: string;
  /** EIP-1559 priority fee per gas */
  maxPriorityFeePerGas?: string;
  /** Transaction nonce */
  nonce?: number;
  /** Chain ID for replay protection */
  chainId?: number;
}

/**
 * A single unsigned transaction ready for signing.
 * Returned by `operations.getUnsignedTransactions()`.
 */
export interface UnsignedTransactionDetail {
  /** Transaction attempt ID — use this when calling submitHash with transactionId */
  attemptId: number;
  /** Serialized unsigned transaction (base64 for Solana, base64-encoded hex for EVM) */
  unsignedTransaction: { serialized: string };
  /** EVM-specific transaction fields for wallets that build from components */
  evmTransaction?: EvmTransactionFields;
  /** Blockchain network */
  blockchain: string;
  /** Human-readable step description (e.g., 'APPROVE_TOKEN', 'SUPPLY_TO_PROVIDER') */
  description?: string;
}

// ============================================
// TRANSACTION SUBMISSION TYPES
// ============================================

export interface SubmitHashRequest {
  operationId: number;
  txHash: string;
  /** Transaction ID for multi-transaction operations (e.g., EVM APPROVE + SUPPLY). If omitted, associates hash with first unsigned transaction. */
  transactionId?: number;
}

export interface SubmitSignedRequest {
  operationId: number;
  signedTransaction: string;
  /** Optional - will be computed from signedTransaction if not provided */
  txHash?: string;
}

export interface TransactionStatusResponse {
  id: number;
  operationId: number;
  status: TransactionStatus;
  txHash?: string;
  confirmations?: number;
  blockNumber?: number;
  error?: string;
}

// ============================================
// CANCEL OPERATION TYPES
// ============================================

export interface CancelOperationResponse {
  operationId: number;
  status: string;
  success: boolean;
}

// ============================================
// TRANSACTION RECOVERY TYPES
// ============================================

export interface RecoverTransactionRequest {
  txHash: string;
  /** Transaction ID from the transactions array. If omitted, attempts to match first unsigned transaction. */
  transactionId?: number;
}

export interface RecoverTransactionResponse {
  success: boolean;
  transactionId: number;
  txHash: string;
}

// ============================================
// WALLET TYPES
// ============================================

export interface RegisterWalletRequest {
  walletAddress: string;
  blockchain: Blockchain | `${Blockchain}`;
  userId?: string;
  orgMetadata?: Record<string, unknown>;
}

export interface WalletResponse {
  walletId: number;
  walletAddress: string;
  blockchain: Blockchain;
  userId?: string;
  orgMetadata?: Record<string, unknown>;
  walletProfileName?: string;
  walletProfileId?: number;
  createdAt: string;
}

export interface WalletListResponse {
  wallets: WalletResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface WalletListQuery {
  userId?: string;
  blockchain?: Blockchain | `${Blockchain}`;
  page?: number;
  limit?: number;
}

export interface UpdateWalletRequest {
  userId?: string;
  orgMetadata?: Record<string, unknown>;
}

export type WalletIdentifier = { walletAddress: string } | { walletId: number };
export type WalletOrUserIdentifier = { walletAddress: string } | { walletId: number } | { userId: string };

// ============================================
// ERROR TYPES
// ============================================

/**
 * SDK error codes for machine-readable error handling.
 * These mirror the backend SdkErrorCode enum.
 */
export enum ErrorCode {
  // Validation errors
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Business logic errors
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  STRATEGY_NOT_ACTIVE = 'STRATEGY_NOT_ACTIVE',
  ALLOCATION_NOT_FOUND = 'ALLOCATION_NOT_FOUND',
  OPERATION_EXPIRED = 'OPERATION_EXPIRED',
  OPERATION_ALREADY_SUBMITTED = 'OPERATION_ALREADY_SUBMITTED',
  TOKEN_MISMATCH = 'TOKEN_MISMATCH',
  INVALID_OPERATION_STATUS = 'INVALID_OPERATION_STATUS',
  OPERATION_IN_PROGRESS = 'OPERATION_IN_PROGRESS',

  // Resource errors
  VENUE_NOT_FOUND = 'VENUE_NOT_FOUND',
  STRATEGY_NOT_FOUND = 'STRATEGY_NOT_FOUND',
  OPERATION_NOT_FOUND = 'OPERATION_NOT_FOUND',
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',

  // Simulation errors
  INSUFFICIENT_GAS = 'INSUFFICIENT_GAS',
  SIMULATION_FAILED = 'SIMULATION_FAILED',

  // Client-side errors
  INVALID_API_KEY = 'INVALID_API_KEY',
  API_KEY_DISABLED = 'API_KEY_DISABLED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Transaction failure codes for blockchain-specific errors.
 */
export enum TransactionFailureCode {
  /** Smart contract execution reverted */
  REVERTED = 'REVERTED',
  /** Insufficient gas */
  OUT_OF_GAS = 'OUT_OF_GAS',
  /** Not included in block within timeout */
  TIMEOUT = 'TIMEOUT',
  /** Nonce already used */
  NONCE_TOO_LOW = 'NONCE_TOO_LOW',
  /** Not enough native token for gas */
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  /** Transaction replaced by another */
  REPLACED = 'REPLACED',
  /** Dropped from mempool */
  DROPPED = 'DROPPED',
  /** Unknown failure */
  UNKNOWN = 'UNKNOWN',
}

// ============================================
// RAMP TYPES
// ============================================

export interface RampKybStatusResponse {
  kybStatus: string | null;
  applicationUrl: string | null;
  onrampAccount: RampOnrampAccountResponse | null;
  onrampAccounts: RampOnrampAccountResponse[];
}

export interface CreateRampOnrampAccountRequest {
  orgWalletId?: number;
  walletAddress?: string;
  blockchain?: string;
  destinationAsset: string;
  rail?: string;
}

export interface RampOnrampAccountResponse {
  id: number;
  dakotaOnrampId: string;
  bankAccountNumber: string;
  routingNumber: string;
  bankName: string;
  capabilities: string[];
  status: string;
  sourceAsset: string;
  destinationAsset: string;
  networkId: string;
  destinationWallet?: {
    id: number;
    name: string;
    address: string;
    network: string;
  };
}

export interface RampTransactionResponse {
  id: number;
  dakotaTransactionId: string;
  usdAmount: string;
  totalFeeAmount?: string;
  developerFeeAmount?: string;
  deliveredAmount?: string;
  status: string;
  type?: string;
  sourceAsset?: string;
  destinationAsset?: string;
  networkId?: string;
  exchangeRate?: string;
  txHash?: string;
  paymentRail?: string;
  paymentReference?: string;
  failureReason?: string;
  statusHistory: { status: string; timestamp: string }[];
  createdAt: string;
  completedAt?: string;
}

export interface RampTransactionListResponse {
  data: RampTransactionResponse[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
}

export interface RampSummaryResponse {
  totalVolumeUsd: number;
  totalFeesUsd: number;
  totalDelivered: number;
  activeRampRecipients: number;
  transactionCount: number;
  periodBreakdown: Array<{ date: string; volumeUsd: number; transactions: number }>;
}

export interface RampExportParams {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ── Offramp types ──

export interface CreateRampOfframpAccountRequest {
  orgWalletId: number;
  sourceAsset?: string;
  rail?: string;
  bankDetails: {
    routingNumber: string;
    accountNumber: string;
    accountType: string;
    accountHolderName: string;
    bankName: string;
  };
}

export interface RampOfframpAccountResponse {
  id: number;
  dakotaOfframpId: string;
  sourceCryptoAddress?: string;
  sourceAsset?: string;
  destinationAsset?: string;
  networkId?: string;
  rail?: string;
  fiatRoutingNumber?: string;
  fiatAccountNumberMasked?: string;
  fiatAccountType?: string;
  fiatAccountHolderName?: string;
  fiatBankName?: string;
  status: string;
  sourceWallet?: {
    id: number;
    name: string;
    address: string;
    network: string;
  };
}

export interface RampOfframpStatusResponse {
  kybStatus: string | null;
  offrampAccounts: RampOfframpAccountResponse[];
}

export class RebelfiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: ErrorCode | string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'RebelfiError';
  }

  /**
   * Check if error matches a specific error code
   */
  is(code: ErrorCode): boolean {
    return this.code === code;
  }
}
