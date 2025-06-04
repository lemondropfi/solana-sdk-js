export type Token = {
    name: string;
    symbol: string;
    mint: string;
    decimals: number;
};

export type CreateResponse = {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    priceImpactPct: string;
    routePlan: Array<{
        swapInfo: {
            ammKey: string;
            label: string;
            inputMint: string;
            outputMint: string;
            inAmount: string;
            outAmount: string;
            feeAmount: string;
            feeMint: string;
        };
        percent: number;
    }>;
    feeMint: string;
    feeBps: number;
    prioritizationFeeLamports: number;
    swapType: string;
    gasless: boolean;
    requestId: string;
    totalTime: number;
    quoteId: string;
    maker: string;
    expireAt: string;
    platformFee: {
        amount: string;
        feeBps: number;
    };
    dynamicSlippageReport: {
        slippageBps: number;
        categoryName: string;
        heuristicMaxSlippageBps: number;
    };
};

export type ExecuteResponse = {
    status: string;
    signature: string;
    slot: string;
    error: string;
    code: number;
    totalInputAmount: string;
    totalOutputAmount: string;
    inputAmountResult: string;
    outputAmountResult: string;
    swapEvents: Array<{
        inputMint: string;
        inputAmount: string;
        outputMint: string;
        outputAmount: string;
    }>;
};

const inputTokens: Token[] = [
    { name: "SOL", symbol: "SOL", mint: "So11111111111111111111111111111111111111111", decimals: 9 },
    { name: "Jito Staked SOL", symbol: "JitoSOL", mint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn", decimals: 9 },
    { name: "Jupiter Staked SOL", symbol: "JupSOL", mint: "jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v", decimals: 9 },
    { name: "Marinade staked SOL", symbol: "mSOL", mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", decimals: 9 },
    { name: "Binance Staked SOL", symbol: "BNSOL", mint: "BNso1VUJnh4zcfpZa6986Ea66P6TCp59hvtNJ8b1X85", decimals: 9 },
    { name: "USD Coin", symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
    { name: "USDT", symbol: "USDT", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
];

const outputTokens: Token[] = [
    { name: "Wrapped BTC (Wormhole)", symbol: "WBTC", mint: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh", decimals: 8 },
    { name: "Coinbase Wrapped BTC", symbol: "cbBTC", mint: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij", decimals: 8 },
    { name: "Threshold Bitcoin", symbol: "TBTC", mint: "6DNSN2BJsaPFdFFc1zP37kkeNe4Usc1Sqkzr9C9vPWcU", decimals: 8 },
];

const feeAccounts: Record<typeof outputTokens[number]['mint'], string> = {
    [outputTokens[0].mint]: "5wZ7QBaj9yKRSB1Jvk7BL7JK83kYXvUfT6Lq5aKYoGKn",
    [outputTokens[1].mint]: "8bc5DkHd1zM5m3uvq8xahX8bgMpSRy7o8S7LF2KhTRLU",
    [outputTokens[2].mint]: "3jykNphaPhnabFdQ8h8nv3WqCbgSt63BhG4k1Qk6gJM9",
};

export class Lemondrop {
    inputTokens = inputTokens;
    outputTokens = outputTokens;

    roundup = {
        create: async ({
            inputToken,
            outputToken,
            amount,
            taker,
        }: {
            inputToken: typeof inputTokens[number];
            outputToken: typeof outputTokens[number];
            amount: string | number;
            taker: string;
        }): Promise<CreateResponse> => {
            try {
                const invalidInputToken = !inputTokens.some(token => token.mint === inputToken.mint);
                const invalidOutputToken = !outputTokens.some(token => token.mint === outputToken.mint);

                if (invalidInputToken || invalidOutputToken) {
                    throw new Error("Invalid inputToken or outputToken");
                }

                const invalidAmount =
                    (typeof amount !== 'string' && typeof amount !== 'number') ||
                    (typeof amount === 'number' && amount <= 0) ||
                    (typeof amount === 'string' && Number(amount) <= 0);

                if (invalidAmount) {
                    throw new Error("Invalid amount");
                }

                if (!taker) {
                    throw new Error("Invalid taker");
                }

                const params = {
                    inputMint: inputToken.mint,
                    outputMint: outputToken.mint,
                    amount: Math.floor(
                        Number(amount) * Math.pow(10, inputToken.decimals)
                    ).toString(),
                    taker,
                    feeAccount: feeAccounts[outputToken.mint],
                    feeBps: "100",
                };
                const searchParams = new URLSearchParams(params);
                const url = `https://lite-api.jup.ag/ultra/v1/order?${searchParams.toString()}`;
                const response = await fetch(url);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText);
                }

                return await response.json();
            } catch (err) {
                console.error("Lemondrop.transaction.create error:", err);
                throw err;
            }
        },
        execute: async ({
            signedTransaction,
            requestId,
        }: {
            signedTransaction: string;
            requestId: string;
        }): Promise<ExecuteResponse> => {
            if (!signedTransaction || !requestId) {
                throw new Error("Invalid signedTransaction or requestId");
            }

            try {
                const body = {
                    signedTransaction,
                    requestId,
                };
                const url = "https://lite-api.jup.ag/ultra/v1/execute";

                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText);
                }

                return await response.json();
            } catch (err) {
                console.error("Lemondrop.transaction.execute error:", err);
                throw err;
            }
        },
    };
}

