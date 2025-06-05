# @lemondropfi/solana-sdk

A compact TypeScript SDK for interacting with Lemondrop's Solana-based roundup and swap service. This SDK allows you to easily create and execute token roundups from supported input tokens (e.g., SOL, USDC) to supported output tokens (e.g., WBTC, cbBTC, TBTC) on Solana.

## Features
- **Token Support:** Predefined input and output tokens with mint addresses and decimals.
- **Roundup Creation:** Quote and prepare a swap transaction for a given input/output token pair and amount.
- **Roundup Execution:** Execute a signed transaction for a previously created roundup.
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
```

### Executing a Roundup
After signing the transaction (not handled by this SDK), execute it:

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
- `roundup.execute({ signedTransaction, requestId })`: Executes a signed roundup transaction

### Types
- `Token`: `{ name, symbol, mint, decimals }`
- `CreateResponse`: Quote and transaction details
- `ExecuteResponse`: Execution result and swap events

## Notes
- You must sign the transaction using your preferred Solana wallet or library before calling `execute`.
- Only the listed tokens are supported.
- Errors are thrown for invalid tokens, amounts, or API failures.