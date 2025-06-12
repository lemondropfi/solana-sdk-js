# @lemondropfi/solana-sdk

A compact TypeScript SDK for Bitcoin roundup swaps on Solana. This SDK simplifies swapping from various Solana tokens (SOL, staked SOL, stablecoins) to Bitcoin-wrapped tokens (WBTC, cbBTC, TBTC) with optional referral fee splitting.

## Features
- **Bitcoin-Focused Swaps:** Specialized for swapping to Bitcoin-wrapped tokens on Solana
- **High-Performance Trading:** Optimal pricing and execution for Bitcoin swaps
- **Referral Fee Support:** Built-in support for fee sharing through referral accounts
- **Flexible Token Support:** Supports SOL, liquid staking tokens, and stablecoins as input
- **TypeScript Types:** Strongly typed API responses and token definitions

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
- **Input tokens:**
  - SOL, JitoSOL, JupSOL, mSOL, BNSOL, USDC, USDT
- **Output tokens:**
  - WBTC (Wormhole), cbBTC (Coinbase), TBTC (Threshold)

Access supported tokens:
```ts
lemondrop.inputTokens // Array of input Token objects
lemondrop.outputTokens // Array of output Token objects
```

### Creating a Roundup
Create a swap transaction for Bitcoin roundups:

```ts
const inputToken = lemondrop.inputTokens.find(t => t.symbol === 'SOL');
const outputToken = lemondrop.outputTokens.find(t => t.symbol === 'WBTC');
const amount = '0.01'; // Amount in input token units (0.01 SOL)
const taker = 'YourSolanaWalletAddress';

// Basic swap without referral fees
const response = await lemondrop.createRoundup({
  inputToken,
  outputToken,
  amount,
  taker,
});

// Swap with referral fee (for revenue sharing)
const responseWithFees = await lemondrop.createRoundup({
  inputToken,
  outputToken,
  amount,
  taker,
  referralAccount: 'ReferralAccount', // Optional: referral account
  referralFee: '50', // Optional: fee in basis points (50 = 0.5%)
});

// Response contains transaction details, pricing, and execution info
console.log(response.transaction); // Base64 transaction to sign
console.log(response.requestId); // For execution tracking
```

### Executing a Roundup
After creating a roundup, you have two options:

#### Option 1: Use Your Own Wallet (Recommended)
Sign and send the transaction using your preferred wallet or method:
```ts
// Most dApps will handle signing/sending themselves
const transaction = response.transaction;
const requestId = response.requestId;

// Sign with wallet (Phantom, Solflare, etc.)
// Send transaction to network
// Handle success/failure
```

#### Option 2: Use SDK Execution (Optional)
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

## Referral Fee Integration

The SDK supports referral programs for revenue sharing:

```ts
// Example: 50 basis points (0.5%) referral fee
const response = await lemondrop.createRoundup({
  inputToken: solToken,
  outputToken: wbtcToken,
  amount: '1.0',
  taker: userWallet,
  referralAccount: 'ReferralAccountPubkey',
  referralFee: '50' // 0.5% fee
});
```

### Setting Up Referral Accounts
**Get started with the referral program:** Visit the [Referral Dashboard](https://referral.jup.ag/) to create your referral account and start earning fees from your integrations.

To use referral fees, you need to:
1. Create a referral account for fee collection
2. Initialize token accounts for each token you want to collect fees in
3. Pass the referral account address in your `createRoundup` calls

## API Reference

### `Lemondrop`
- `inputTokens`: Array of supported input tokens
- `outputTokens`: Array of supported output tokens
- `createRoundup(params)`: Creates a swap transaction for Bitcoin roundups
- `executeRoundup(params)`: (Optional) Executes a signed transaction

### Methods

#### `createRoundup`
```ts
createRoundup({
  inputToken: Token;
  outputToken: Token;
  amount: string | number;
  taker: string;
  referralAccount?: string; // Optional referral account for fees
  referralFee?: string;     // Optional fee in basis points
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
- `Token`: `{ name, symbol, mint, decimals }`
- `CreateRoundupResponse`: Complete swap response with transaction, pricing, and route details
- `ExecuteRoundupResponse`: Execution result with status, signature, and swap events

## Error Handling

The SDK provides clear error handling for swap failures:

```ts
try {
  const response = await lemondrop.createRoundup({
    inputToken,
    outputToken,
    amount,
    taker,
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
  inputToken: lemondrop.inputTokens.find(t => t.symbol === 'SOL'),
  outputToken: lemondrop.outputTokens.find(t => t.symbol === 'WBTC'),
  amount: '1.0', // 1 SOL
  taker: 'YourWalletAddress'
});

// Sign response.transaction and send to network
```

### USDC to cbBTC with Referral Fees
```ts
const response = await lemondrop.createRoundup({
  inputToken: lemondrop.inputTokens.find(t => t.symbol === 'USDC'),
  outputToken: lemondrop.outputTokens.find(t => t.symbol === 'cbBTC'),
  amount: '1000', // $1000 USDC
  taker: 'UserWalletAddress',
  referralAccount: 'ReferralAccount',
  referralFee: '25' // 0.25% referral fee
});
```



## Notes
- Optimized for Bitcoin roundup trading on Solana
- Referral fees enable revenue sharing with partners
- Supports the major Bitcoin-wrapped tokens on Solana
- Input tokens include SOL, liquid staking tokens, and major stablecoins