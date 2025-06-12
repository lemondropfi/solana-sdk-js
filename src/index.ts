export type OutputToken = {
    name: string;
    symbol: string;
    mint: string;
    decimals: number;
};

export type CreateRoundupResponse = {
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
    swapType: "aggregator" | "rfq" | "hashflow";
    transaction: string | null;
    gasless: boolean;
    requestId: string;
    totalTime: number;
    taker: string | null;
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

export type ExecuteRoundupResponse = {
    status: "Success" | "Failed";
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

const outputTokens: OutputToken[] = [
    { name: "Wrapped BTC (Wormhole)", symbol: "WBTC", mint: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh", decimals: 8 },
    { name: "Coinbase Wrapped BTC", symbol: "cbBTC", mint: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij", decimals: 8 },
    { name: "Threshold Bitcoin", symbol: "TBTC", mint: "6DNSN2BJsaPFdFFc1zP37kkeNe4Usc1Sqkzr9C9vPWcU", decimals: 8 },
];

export class Lemondrop {
    outputTokens = outputTokens;

    createRoundup = async ({
        inputTokenMint,
        outputToken,
        amount,
        taker,
    }: {
        inputTokenMint: string;
        outputToken: OutputToken;
        amount: string;
        taker: string;
    }): Promise<CreateRoundupResponse> => {
        if (!outputTokens.find(token => token.mint === outputToken.mint)) {
            throw new Error("Invalid outputToken");
        }

        try {
            const params: Record<string, string> = {
                inputMint: inputTokenMint,
                outputMint: outputToken.mint,
                amount,
                taker,
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
            console.error("Lemondrop.createRoundup error:", err);
            throw err;
        }
    }
    executeRoundup = async ({
        signedTransaction,
        requestId,
    }: {
        signedTransaction: string;
        requestId: string;
    }): Promise<ExecuteRoundupResponse> => {
        if (!signedTransaction) {
            throw new Error("Invalid signedTransaction");
        }

        if (!requestId) {
            throw new Error("Invalid requestId");
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
            console.error("Lemondrop.executeRoundup error:", err);
            throw err;
        }
    }
}

