# RebelFi SDK

Official TypeScript SDK for interacting with the RebelFi API.

## Installation

```bash
npm install @rebelfi/sdk
# or
yarn add @rebelfi/sdk
```

## Prerequisites

To use the SDK you need a RebelFi API key. API keys are scoped to a **Wallet Profile** — you must create a profile in the dashboard before you can generate a key.

1. Log into the [RebelFi dashboard](https://api.rebelfi.io)
2. Go to **Settings → Wallet Profiles** and create a profile (choose a name and enable the chains you need)
3. Go to **Settings → API Keys**, click **Generate API Key**, and select the profile you just created

All wallets registered via the SDK under that key are automatically associated with its Wallet Profile.

## Quick Start

```typescript
import { RebelfiClient } from '@rebelfi/sdk';

// Production environment
const client = new RebelfiClient({
  apiKey: 'your_api_key_here'
});

// Sandbox environment (for testing)
const sandboxClient = new RebelfiClient({
  apiKey: 'your_sandbox_api_key_here',
  sandbox: true
});

// List available venues with their strategies
const { venues } = await client.venues.list();

// Find a strategy to use
const venue = venues[0];
const strategy = venue.strategies[0];

// Plan a supply operation
const operation = await client.operations.supply({
  walletAddress: 'So11...abc',
  strategyId: strategy.strategyId,
  amount: '1000000', // 1 USDC in base units
  tokenAddress: strategy.tokenAddress
});

// Sign the transaction (Solana example)
import { Connection, VersionedTransaction } from '@solana/web3.js';

const unsignedTxBase64 = operation.transactions[0].unsignedTransaction;
const unsignedTxBuffer = Buffer.from(unsignedTxBase64, 'base64');
const transaction = VersionedTransaction.deserialize(unsignedTxBuffer);

// Sign with user's keypair
transaction.sign([userKeypair]);

// Broadcast and confirm
const connection = new Connection('https://api.mainnet-beta.solana.com');
const txHash = await connection.sendTransaction(transaction);
await connection.confirmTransaction(txHash, 'confirmed');

// Submit the hash to RebelFi
await client.transactions.submitHash({
  operationId: operation.operationId,
  txHash
});
```

## API Reference

### Client Configuration

```typescript
const client = new RebelfiClient({
  apiKey: string,        // Required: Your API key
  sandbox?: boolean,     // Optional: Use sandbox environment (default: false)
  baseUrl?: string,      // Optional: Override base URL (e.g., for proxying)
  timeout?: number       // Optional: Request timeout in ms (default: 60000)
});
```

**Environment URLs:**
- Production: `https://api.rebelfi.io` (default)
- Sandbox: `https://sandbox-api.rebelfi.io` (when `sandbox: true`)

### Venues

List and retrieve yield venues with their available strategies.

```typescript
// List all venues
const { venues, count, strategyCount } = await client.venues.list();

// Filter by blockchain
const solanaVenues = await client.venues.list({ blockchain: 'solana' });

// Filter by token
const usdcVenues = await client.venues.list({ token: 'USDC' });

// Get venue details by ID
const venue = await client.venues.get(venueId);

// Access strategies within a venue.
// apy is before RebelFi's yield share; apyNet is after it (what the holder earns).
for (const strategy of venue.strategies) {
  console.log(`${strategy.name}: ${(strategy.apyNet * 100).toFixed(2)}% APY`);
}

// Daily APY history of a strategy (1-90 days, default 30, ending yesterday UTC)
const { yieldShare, history } = await client.venues.apyHistory(strategyId, { days: 30 });
for (const day of history) {
  console.log(`${day.date}: ${day.apyGross} gross, ${day.apyNet} net`);
}

// Price apyNet for one wallet (walletAddress, walletId or userId, at most one)
const forWallet = await client.venues.apyHistory(strategyId, { days: 7, walletId: 42 });
```

### Allocations

Query user allocations and earnings history.

```typescript
// List allocations for a wallet
const { allocations, totalValue, totalYieldEarned } = await client.allocations.list({
  walletAddress: 'So11...abc'
});

// Filter by blockchain
const solanaAllocations = await client.allocations.list({
  walletAddress: 'So11...abc',
  blockchain: 'solana'
});

// Or select the wallet by ID, or every wallet of one of your users
const byWalletId = await client.allocations.list({ walletId: 42 });
const byUser = await client.allocations.list({ userId: 'user_123' });

// Get a wallet's allocation in a specific strategy (wallet address or wallet ID).
// currentValue and apyNet are after this wallet's yield share; yieldEarned and apy are before it.
const allocation = await client.allocations.get(strategyId, 'So11...abc');
const sameAllocation = await client.allocations.get(strategyId, 42);

// Get earnings history
const earnings = await client.allocations.earnings({
  walletAddress: 'So11...abc',
  blockchain: 'solana',
  token: 'USDC',
  days: 30,
  includeBreakdown: true
});

console.log(`Total yield: ${earnings.totalYieldEarned}`);
for (const day of earnings.history) {
  console.log(`${day.date}: ${day.yieldEarned}`);
}

// Aggregate overview of every wallet in the key's wallet profile
const overview = await client.allocations.overview();
console.log(`${overview.activeWallets}/${overview.totalWallets} wallets, $${overview.totalValueUsd}`);

// Admin keys only: per-profile breakdown plus org-wide totals (optionally one profile)
const { profiles, totals } = await client.allocations.overviewAll();
```

### Wallets

Register the wallets you operate for, and prove you control them.

```typescript
import { WalletControlStatus } from '@rebelfi/sdk';

// 1. Ask for a one-time challenge for the address
const challenge = await client.wallets.challenge({
  walletAddress: 'So11...abc',
  blockchain: 'solana'
});

// 2. Sign challenge.message with the wallet before challenge.expiresAt
//    - Solana: ed25519 over the UTF-8 bytes of the message, base58-encoded
//    - EVM: personal_sign / signMessage(message), 0x hex (ERC-1271 for contract wallets)
const signature = await signWithWallet(challenge.message); // your signing code

// 3. Register the wallet as CONTROLLED (idempotent: re-registering returns the existing wallet)
const wallet = await client.wallets.register({
  walletAddress: 'So11...abc',
  blockchain: 'solana',
  userId: 'user_123',                 // Optional: your own user identifier
  orgMetadata: { tier: 'gold' },      // Optional: free-form metadata
  proof: { challengeId: challenge.challengeId, signature }
});

// Without `proof`, the wallet is registered LEGACY (during the deprecation window) or WATCH_ONLY.
// WATCH_ONLY wallets are refused operations with WALLET_NOT_VERIFIED until verified:
if (wallet.control.status === WalletControlStatus.WATCH_ONLY) {
  const next = await client.wallets.challenge({ walletAddress: wallet.walletAddress, blockchain: wallet.blockchain });
  const { outcome } = await client.wallets.verify(wallet.walletId, {
    challengeId: next.challengeId,
    signature: await signWithWallet(next.message)
  });
  console.log(outcome); // 'CONTROLLED' | 'UNCHANGED' | 'DISPUTED'
}

// List, get and update wallets
const { wallets, total } = await client.wallets.list({ userId: 'user_123', page: 1, limit: 50 });
const fetched = await client.wallets.get(wallet.walletId);
await client.wallets.update(wallet.walletId, { orgMetadata: { tier: 'platinum' } });
```

### Wallet Profiles

```typescript
const { walletProfiles } = await client.walletProfiles.list();
for (const profile of walletProfiles) {
  console.log(`${profile.name}: ${profile.walletCount} wallets on ${profile.enabledChains.join(', ')}`);
}
```

### Ramp

Fiat on-ramp and off-ramp for your organization. KYB approval is required first.

```typescript
// KYB
const kyb = await client.ramp.getKybStatus();
if (!kyb.kybStatus) {
  const { kybUrl } = await client.ramp.startKyb(); // send your team to kybUrl
}

// On-ramp: get bank details that convert incoming USD into a stablecoin on one of your wallets
const onramp = await client.ramp.createOnrampAccount({
  orgWalletId: wallet.walletId,
  destinationAsset: 'USDC'
});
console.log(onramp.bankName, onramp.routingNumber, onramp.bankAccountNumber);

// Transactions, summary and CSV export
const { data, pagination } = await client.ramp.listTransactions({ page: 1, perPage: 25 });
const summary = await client.ramp.getSummary({ dateFrom: '2026-01-01', dateTo: '2026-01-31' });
const csv = await client.ramp.exportTransactions({ dateFrom: '2026-01-01' });

// Off-ramp accounts, status and transactions follow the same pattern:
// createOfframpAccount, listOfframpAccounts, getOfframpStatus,
// listOfframpTransactions, getOfframpTransaction, exportOfframpTransactions.
// Recipients: createRecipient, listRecipients, getRecipient, archiveRecipient,
// createRecipientOnrampAccount, createRecipientOfframpAccount.

// Testing: simulate KYB decisions and transactions
await client.ramp.simulateKybApproval();
await client.ramp.simulateOnrampTransaction({ scenario: 'success', usdAmount: 100, onrampAccountId: onramp.id });
```

### Operations

Create supply and unwind operations.

```typescript
// Plan a supply operation (deposit into yield)
const supplyOp = await client.operations.supply({
  walletAddress: 'So11...abc',
  strategyId: 42,
  amount: '1000000',  // Amount in base units
  tokenAddress: 'EPjFW...'
});

// Returns unsigned transactions to sign
console.log(supplyOp.operationId);
console.log(supplyOp.transactions[0].unsignedTransaction);

// Plan an unwind operation (withdraw from yield)
const unwindOp = await client.operations.unwind({
  walletAddress: 'So11...abc',
  strategyId: 42,
  amount: '500000'
});

// Get operation status
const operation = await client.operations.get(operationId);
console.log(`Status: ${operation.status}`);

// Check if any previous operations were auto-cancelled
if (supplyOp.cancelledOperations?.length) {
  console.log(`Auto-cancelled operations: ${supplyOp.cancelledOperations}`);
}

// Cancel a pending operation
const cancelResult = await client.operations.cancel(operationId);
console.log(`Cancelled: ${cancelResult.success}`);
```

### Transactions

Submit signed transactions after user signs.

```typescript
// Option 1: User broadcasts, submit hash
// Use when your app broadcasts the signed transaction
await client.transactions.submitHash({
  operationId: operation.operationId,
  txHash: '5abc...'
});

// Option 2: Submit signed tx for RebelFi to broadcast
// Use when you want RebelFi to broadcast
await client.transactions.submitSigned({
  operationId: operation.operationId,
  signedTransaction: 'base64_encoded_signed_tx',
  txHash: '5abc...'  // Optional, computed if not provided
});

// For multi-transaction operations (EVM), specify which transaction:
await client.transactions.submitHash({
  operationId: operation.operationId,
  txHash: '0xabc...',
  transactionId: operation.transactions[0].id  // Target specific tx
});

// Recover a transaction that was broadcasted but not submitted
const recovered = await client.transactions.recover(operation.operationId, {
  txHash: '0xabc...'
});

// Get transaction status
const txStatus = await client.transactions.get(transactionId);
console.log(`Status: ${txStatus.status}`);
```

## Error Handling

The SDK throws `RebelfiError` for API errors:

```typescript
import { RebelfiClient, RebelfiError, ErrorCode } from '@rebelfi/sdk';

try {
  const operation = await client.operations.supply({ ... });
} catch (error) {
  if (error instanceof RebelfiError) {
    console.log(`Error: ${error.message}`);
    console.log(`Status: ${error.statusCode}`);
    console.log(`Code: ${error.code}`);

    // Check specific error codes
    if (error.is(ErrorCode.INSUFFICIENT_BALANCE)) {
      // Handle insufficient balance
    } else if (error.is(ErrorCode.STRATEGY_NOT_ACTIVE)) {
      // Handle inactive strategy
    } else if (error.is(ErrorCode.INVALID_API_KEY)) {
      // Handle auth error
    }
  }
}
```

### Error Codes

- `INVALID_AMOUNT`, `INVALID_ADDRESS`, `INVALID_TOKEN` - Validation errors
- `INSUFFICIENT_BALANCE`, `STRATEGY_NOT_ACTIVE`, `OPERATION_EXPIRED`, `INVALID_OPERATION_STATUS` - Business logic errors
- `VENUE_NOT_FOUND`, `STRATEGY_NOT_FOUND`, `OPERATION_NOT_FOUND` - Resource errors
- `INVALID_API_KEY`, `API_KEY_DISABLED`, `API_KEY_EXPIRED`, `API_KEY_ADDRESS_NOT_ALLOWED`, `ORGANIZATION_PENDING_APPROVAL`, `ORGANIZATION_SUSPENDED`, `FORBIDDEN`, `VALIDATION_FAILED`, `RATE_LIMIT_EXCEEDED` - Auth, access, and validation errors
- `WALLET_NOT_VERIFIED`, `CHALLENGE_EXPIRED`, `CHALLENGE_USED`, `CHALLENGE_MISMATCH`, `INVALID_SIGNATURE`, `ADDRESS_NOT_CLAIMABLE` - Wallet ownership errors

On 401, 403 and 429 responses, `error.code` is the server's code when it sends one (for example `API_KEY_EXPIRED` or `WALLET_NOT_VERIFIED`). Before 1.4.0 these were always `INVALID_API_KEY`, `API_KEY_DISABLED` or `RATE_LIMIT_EXCEEDED`.

## TypeScript Support

The SDK provides full TypeScript definitions:

```typescript
import {
  RebelfiClient,
  RebelfiError,
  Venue,
  Strategy,
  Allocation,
  OperationResponse,
  Transaction,
  ErrorCode
} from '@rebelfi/sdk';

const client = new RebelfiClient({ apiKey: 'your_api_key' });

const venues: Venue[] = (await client.venues.list()).venues;
const operation: OperationResponse = await client.operations.supply({ ... });
```

## License

MIT
