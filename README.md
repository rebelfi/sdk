# RebelFi SDK

Official TypeScript SDK for interacting with the RebelFi API.

## Installation

```bash
npm install @rebelfi/sdk
# or
yarn add @rebelfi/sdk
```

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

// Access strategies within a venue
for (const strategy of venue.strategies) {
  console.log(`${strategy.name}: ${strategy.apy * 100}% APY`);
}
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

// Get allocation at a specific venue
const allocation = await client.allocations.get(venueId, walletAddress);

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
- `INVALID_API_KEY`, `API_KEY_DISABLED`, `RATE_LIMIT_EXCEEDED` - Auth errors

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
