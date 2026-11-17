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
  /** Current APY as decimal (e.g., 0.085 for 8.5%), before the yield share */
  apy: number;
  /**
   * Current APY as decimal, after the yield share of the key's holders: end-user wallets of the key's
   * wallet profile, or the organization's own wallets for an admin key. Equals `apy` when `apy` <= 0.
   */
  apyNet: number;
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

/**
 * Options for `venues.apyHistory()`. Pass at most one wallet selector to price `apyNet` for that
 * wallet; without one, the key's holders are used (see `Strategy.apyNet`).
 */
export interface ApyHistoryQuery {
  /** Number of days of history, 1-90 (default: 30) */
  days?: number;
  walletAddress?: string;
  walletId?: number;
  userId?: string;
}

export interface ApyHistoryPoint {
  /** UTC date (YYYY-MM-DD) */
  date: string;
  /** Time-weighted average APY over the UTC day, as decimal, before the yield share */
  apyGross: number;
  /** `apyGross` after the yield share; equals `apyGross` when `apyGross` <= 0 */
  apyNet: number;
}

export interface ApyHistoryResponse {
  strategyId: number;
  /** Yield share applied to every date, as decimal (0.02 = 2%) */
  yieldShare: number;
  /** Daily APY, ascending, ending yesterday (UTC). Days without a sample are omitted */
  history: ApyHistoryPoint[];
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
  /** Current APY as decimal, before the yield share */
  apy: number;
  /** Current APY as decimal, after this wallet's yield share. Equals `apy` when `apy` <= 0 */
  apyNet: number;
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

/**
 * A signed ownership challenge: proof that you hold the key of a wallet address.
 * Get the challenge from `wallets.challenge()`, sign its `message` with the wallet, and submit both.
 * - Solana: ed25519 signature over the UTF-8 bytes of `message`, base58-encoded.
 * - EVM: `personal_sign` / `signMessage(message)`, 0x hex. Contract wallets are checked with ERC-1271.
 */
export interface WalletProof {
  challengeId: number;
  signature: string;
}

export interface RegisterWalletRequest {
  walletAddress: string;
  blockchain: Blockchain | `${Blockchain}`;
  userId?: string;
  orgMetadata?: Record<string, unknown>;
  /**
   * Proof that you control the address. With it the wallet is registered `CONTROLLED`.
   * Without it, the wallet is `LEGACY` during the deprecation window (if no other organization owns
   * the address), otherwise `WATCH_ONLY`.
   */
  proof?: WalletProof;
}

export interface WalletChallengeRequest {
  walletAddress: string;
  blockchain: Blockchain | `${Blockchain}`;
}

export interface WalletChallengeResponse {
  challengeId: number;
  /** The exact text to sign */
  message: string;
  /** ISO 8601. Sign and submit before then */
  expiresAt: string;
}

/**
 * Whether your organization controls a wallet's address.
 * - `CONTROLLED`: control proven (signed challenge, or a wallet RebelFi created).
 * - `LEGACY`: registered without proof; operates normally for now.
 * - `WATCH_ONLY`: balance only. Operations are refused with `WALLET_NOT_VERIFIED` until you verify.
 */
export enum WalletControlStatus {
  CONTROLLED = 'CONTROLLED',
  LEGACY = 'LEGACY',
  WATCH_ONLY = 'WATCH_ONLY',
}

/** How control of a wallet's address was established. */
export enum WalletControlMethod {
  CUSTODY_CREATED = 'CUSTODY_CREATED',
  AGENT_CREATED = 'AGENT_CREATED',
  SIGNED_CHALLENGE = 'SIGNED_CHALLENGE',
  AGENT_SIGNED = 'AGENT_SIGNED',
  OPERATOR = 'OPERATOR',
  MIGRATION = 'MIGRATION',
  LEGACY_SDK = 'LEGACY_SDK',
}

export interface WalletControl {
  status: WalletControlStatus | `${WalletControlStatus}`;
  /** null when watch-only */
  method: WalletControlMethod | `${WalletControlMethod}` | null;
  /** ISO 8601. Present when control was proven */
  provenAt?: string;
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
  control: WalletControl;
}

/**
 * - `CONTROLLED`: your organization now controls the address.
 * - `UNCHANGED`: it already did.
 * - `DISPUTED`: another organization holds the address without proof. The wallet stays watch-only while
 *   RebelFi reviews the dispute.
 */
export type WalletVerificationOutcome = 'CONTROLLED' | 'UNCHANGED' | 'DISPUTED';

export interface VerifyWalletResponse {
  outcome: WalletVerificationOutcome;
  wallet: WalletResponse;
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
// WALLET PROFILE TYPES
// ============================================

export interface WalletProfile {
  id: number;
  name: string;
  isEnabled: boolean;
  enabledChains: string[];
  walletCount: number;
}

export interface WalletProfileListResponse {
  walletProfiles: WalletProfile[];
}

// ============================================
// ORG OVERVIEW TYPES
// ============================================

export interface OrgOverview {
  walletProfileId: number;
  walletProfileName: string;

  totalWallets: number;
  activeWallets: number;

  totalValueUsd: string;
  totalYieldEarnedUsd: string;
  averageApyDecimal: number;

  protocolDistribution: DistributionEntry[];
  assetDistribution: DistributionEntry[];
  blockchainDistribution: DistributionEntry[];
}

export interface DistributionEntry {
  name: string;
  valueUsd: string;
  percentage: number;
  walletCount: number;
}

export interface OrgOverviewTotals {
  totalWallets: number;
  activeWallets: number;
  totalValueUsd: string;
  totalYieldEarnedUsd: string;
  averageApyDecimal: number;
  protocolDistribution: DistributionEntry[];
  assetDistribution: DistributionEntry[];
  blockchainDistribution: DistributionEntry[];
}

export interface OrgOverviewAll {
  profiles: OrgOverview[];
  totals: OrgOverviewTotals;
}

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
  /** The wallet is watch-only: prove control with `wallets.verify()` before operating. `error.details.orgWalletId` */
  WALLET_NOT_VERIFIED = 'WALLET_NOT_VERIFIED',

  // Proof of control errors
  /** The challenge expired (410). Request a new one */
  CHALLENGE_EXPIRED = 'CHALLENGE_EXPIRED',
  /** The challenge was already used (409). Request a new one */
  CHALLENGE_USED = 'CHALLENGE_USED',
  /** Unknown challenge, or one issued for another wallet address or chain (400) */
  CHALLENGE_MISMATCH = 'CHALLENGE_MISMATCH',
  /** The signature isn't the address's signature of the challenge message (400). The challenge is used up */
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  /** Valid proof, but another organization has proven control of the address (409). Contact support */
  ADDRESS_NOT_CLAIMABLE = 'ADDRESS_NOT_CLAIMABLE',

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
  /** Organization exists but a RebelFi operator has not approved it yet */
  ORGANIZATION_PENDING_APPROVAL = 'ORGANIZATION_PENDING_APPROVAL',
  /** Organization was suspended; sign-in and API access are refused */
  ORGANIZATION_SUSPENDED = 'ORGANIZATION_SUSPENDED',
  /** The API key has an allowlist and the request came from outside it. `error.details.address` is your address */
  API_KEY_ADDRESS_NOT_ALLOWED = 'API_KEY_ADDRESS_NOT_ALLOWED',
  /** The API key passed its expiry. Create a new key in the dashboard */
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
  /** Authenticated, but not allowed to perform this action */
  FORBIDDEN = 'FORBIDDEN',
  /** Request body failed validation */
  VALIDATION_FAILED = 'VALIDATION_FAILED',
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

// ── Simulation types ──

export interface SimulateTransactionRequest {
  scenario?: 'success' | 'failed' | 'rejected' | 'reversed';
  usdAmount?: number;
  onrampAccountId?: number;
}

export interface SimulateOfframpTransactionRequest {
  scenario?: 'success' | 'failed';
  usdAmount?: number;
  offrampAccountId?: number;
}

export interface SimulationResponse {
  success: boolean;
  data: {
    simulation_id: string;
    state: string;
  };
}

// ── Recipient types ──

export interface CreateRecipientRequest {
  name: string;
  type?: string;
  externalId?: string;
  address?: {
    street1: string;
    street2?: string;
    city: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface RecipientResponse {
  id: number;
  name: string;
  type: string;
  externalId?: string;
  destinationWalletId?: number;
  destinationWallet?: { id: number; name: string; address: string; network: string };
  address?: {
    street1: string;
    street2?: string;
    city: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  bankAccount?: RampOnrampAccountResponse;
  bankAccounts?: RampOnrampAccountResponse[];
  onrampAccountCount?: number;
  offrampAccountCount?: number;
  totalVolumeUsd?: number;
  monthlyVolumeUsd?: number;
  transactionCount?: number;
  createdAt: string;
  archivedAt?: string;
}

export interface RecipientListResponse {
  data: RecipientResponse[];
  pagination: { page: number; perPage: number; total: number };
}

export interface CreateRecipientOnrampAccountRequest {
  destinationWalletId: number;
  sourceAsset?: string;
  destinationAsset?: string;
  rail?: string;
}

export interface CreateRecipientOfframpAccountRequest {
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
