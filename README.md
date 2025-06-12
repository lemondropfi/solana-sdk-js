# @lemondropfi/solana-sdk

A compact TypeScript SDK for Bitcoin roundup swaps on Solana.

## Features
- **Bitcoin-Focused Swaps:** Specialized for swapping to Bitcoin-wrapped tokens on Solana
- **High-Performance Trading:** Optimal pricing and execution for Bitcoin swaps
- **Flexible Input Support:** Accepts any Solana token mint address as input
- **TypeScript Types:** Strongly typed API responses and token definitions
- **Simple Integration:** Minimal configuration required

## Installation
```sh
npm install @lemondropfi/solana-sdk
```

## Usage

### Import and Initialize
```ts
import { Lemondrop } from '@lemondropfi/solana-sdk';

const lemondrop = new Lemondrop();
```

### Supported Tokens
- **Input tokens:** Any valid Solana token mint address
- **Output tokens:**
  - WBTC (Wormhole), cbBTC (Coinbase), TBTC (Threshold)

Access supported output tokens:
```ts
lemondrop.outputTokens
```

### Creating a Roundup
Create a swap transaction for Bitcoin roundups:

```ts
const outputToken = lemondrop.outputTokens.find(t => t.symbol === 'WBTC');
const inputTokenMint = 'So11111111111111111111111111111111111111112'; // SOL mint
const amount = '10000000'; // Amount in token's base units (0.01 SOL = 10000000 lamports)
const taker = 'Mn7Y...aLQm';

const response = await lemondrop.createRoundup({
  inputTokenMint,
  outputToken,
  amount,
  taker,
});

// Response contains transaction details, pricing, and execution info
console.log(response.transaction); // Base64 transaction to sign
console.log(response.requestId); // For execution tracking
```

### Executing a Roundup
After creating a roundup, you have two options:

#### Option 1: Use Your Own Wallet
Sign and send the transaction using your preferred wallet or method:
```ts
// Most dApps will handle signing/sending themselves
const transaction = response.transaction;
const requestId = response.requestId;

// Sign with wallet (Phantom, Solflare, etc.)
// Send transaction to network
// Handle success/failure
```

#### Option 2: Use SDK Execution
Let the SDK handle execution after you sign:
```ts
const signedTransaction = '...'; // Your base64-signed transaction
const requestId = response.requestId;

const result = await lemondrop.executeRoundup({
  signedTransaction,
  requestId,
});

console.log(result.status); // "Success" or "Failed"
console.log(result.signature); // Transaction signature
console.log(result.swapEvents); // Detailed swap information
```

## API Reference

### `Lemondrop`
- `outputTokens`: Array of supported output tokens
- `createRoundup(params)`: Creates a swap transaction for Bitcoin roundups
- `executeRoundup(params)`: (Optional) Executes a signed transaction

### Methods

#### `createRoundup`
```ts
createRoundup({
  inputTokenMint: string;    // Any Solana token mint address
  outputToken: OutputToken;  // Bitcoin-wrapped token object
  amount: string;           // Amount in token's base units
  taker: string;            // User's wallet address
}): Promise<CreateRoundupResponse>
```

#### `executeRoundup`
```ts
executeRoundup({
  signedTransaction: string;
  requestId: string;
}): Promise<ExecuteRoundupResponse>
```

### Types
- `OutputToken`: `{ name, symbol, mint, decimals }`
- `CreateRoundupResponse`: Complete swap response with transaction, pricing, and route details
- `ExecuteRoundupResponse`: Execution result with status, signature, and swap events

## Error Handling

The SDK provides clear error handling for swap failures:

```ts
try {
  const response = await lemondrop.createRoundup({
    inputTokenMint: 'So11111111111111111111111111111111111111112',
    outputToken: lemondrop.outputTokens.find(t => t.symbol === 'WBTC'),
    amount: '10000000', // 0.01 SOL
    taker: 'Mn7Y...aLQm',
  });
} catch (error) {
  console.error('Swap failed:', error.message);
  // Handle API errors (invalid amounts, insufficient liquidity, etc.)
}
```

## Examples

### Simple SOL to WBTC Swap
```ts
const lemondrop = new Lemondrop();

const response = await lemondrop.createRoundup({
  inputTokenMint: 'So11111111111111111111111111111111111111112', // SOL
  outputToken: lemondrop.outputTokens.find(t => t.symbol === 'WBTC'),
  amount: '1000000000', // 1 SOL (1 billion lamports)
  taker: 'Mn7Y...aLQm'
});

// Sign response.transaction and send to network
```

### USDC to cbBTC Swap
```ts
const response = await lemondrop.createRoundup({
  inputTokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  outputToken: lemondrop.outputTokens.find(t => t.symbol === 'cbBTC'),
  amount: '1000000000', // $1,000 USDC (6 decimals = 1 billion micro-USDC)
  taker: 'Mn7Y...aLQm'
});
```

## Notes
- Optimized for Bitcoin roundup trading on Solana
- Accepts any valid Solana token mint as input
- Supports swaps to Bitcoin-wrapped tokens (WBTC, cbBTC, TBTC)
- Amount should be specified in the token's base units (considering decimals)