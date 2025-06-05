# @lemondropfi/solana-sdk

A compact TypeScript SDK for interacting with Lemondrop's Solana-based roundup and swap service. This SDK allows you to easily create and execute token roundups from supported input tokens (e.g., SOL, USDC) to supported output tokens (e.g., WBTC, cbBTC, TBTC) on Solana.

## Features
- **Token Support:** Predefined input and output tokens with mint addresses and decimals.
- **Roundup Creation:** Quote and prepare a swap transaction for a given input/output token pair and amount.
- **Roundup Execution (Optional):** Optionally execute a signed transaction for a previously created roundup using the SDK, or use your own wallet/background method.
- **TypeScript Types:** Strongly typed API responses and token definitions.

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
  - WBTC, cbBTC, TBTC

You can access the supported tokens via:
```ts
lemondrop.inputTokens // Array of input Token objects
lemondrop.outputTokens // Array of output Token objects
```

### Creating a Roundup
This step fetches a quote and prepares a transaction for a swap.

```ts
const inputToken = lemondrop.inputTokens.find(t => t.symbol === 'SOL');
const outputToken = lemondrop.outputTokens.find(t => t.symbol === 'WBTC');
const amount = '0.01'; // Amount in input token units (e.g., 0.01 SOL)
const taker = 'YourSolanaWalletAddress';

const createResponse = await lemondrop.roundup.create({
  inputToken,
  outputToken,
  amount,
  taker,
});

// createResponse contains transaction details, route plan, and requestId
// createResponse.transaction is the unsigned base64 transaction to be signed and sent
```

### Executing a Roundup (Optional)
After creating a roundup, you have two options:

1. **Use your own wallet or background method:**
   - Sign and send the transaction (`createResponse.transaction`) using a browser wallet (e.g., Phantom, Solflare) or your own background setup.
   - This is the most flexible and recommended approach for most dApps.

2. **Call the SDK's `execute` method (optional):**
   - After signing the transaction, you can call `lemondrop.roundup.execute` to submit it and receive status and swap event details.
   - This is optional and provided for convenience; it returns useful information about the execution status.

```ts
const signedTransaction = '...'; // base64-encoded signed transaction
const requestId = createResponse.requestId;

const executeResponse = await lemondrop.roundup.execute({
  signedTransaction,
  requestId,
});

// executeResponse contains status, signature, and swap event details
```

## API Reference

### `Lemondrop`
- `inputTokens`: Array of supported input tokens
- `outputTokens`: Array of supported output tokens
- `roundup.create({ inputToken, outputToken, amount, taker })`: Prepares a roundup transaction
- `roundup.execute({ signedTransaction, requestId })`: (Optional) Executes a signed roundup transaction and returns status

### Types
- `Token`: `{ name, symbol, mint, decimals }`
- `CreateResponse`: Quote and transaction details
- `ExecuteResponse`: Execution result and swap events

## Notes
- You must sign the transaction using your preferred Solana wallet or library before sending it to the network or calling `execute`.
- Calling `execute` is optional and only needed if you want the SDK to handle transaction submission and status reporting.
- Only the listed tokens are supported.
- Errors are thrown for invalid tokens, amounts, or API failures.