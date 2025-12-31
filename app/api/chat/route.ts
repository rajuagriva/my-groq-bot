import Groq from "groq-sdk";
import { saveTokenUsageRecord, TokenUsageRecord } from "@/lib/tokenStorage";

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Priority-ordered model fallback list
const FALLBACK_MODELS = [
    "llama-3.3-70b-versatile",          // Priority 1 - Robust main model
    "llama-3.1-8b-instant",             // Priority 2 - Fast fallback
    "gemma2-9b-it",                     // Priority 3 - Alternative
] as const;

// Helper function to check if error is retryable
function isRetryableError(error: unknown): boolean {
    const errStr = String(error);
    return (
        errStr.includes('429') ||
        errStr.includes('rate') ||
        errStr.includes('limit') ||
        errStr.includes('503') ||
        errStr.includes('overloaded')
    );
}

// Simple token estimation (approx 4 chars per token for most languages)
function estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
}

// Generate unique user ID based on request headers
function getUserInfo(req: Request): { userId: string; userName: string } {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Create a simple hash for user identification
    const hash = Buffer.from(`${ip}-${userAgent.slice(0, 50)}`).toString('base64').slice(0, 12);

    return {
        userId: `user_${hash}`,
        userName: `User ${hash.slice(0, 6).toUpperCase()}`
    };
}

export async function POST(req: Request) {
    try {
        const { messages, systemPrompt, persona } = await req.json();
        const userInfo = getUserInfo(req);

        // Validate API key
        if (!process.env.GROQ_API_KEY) {
            console.error("[Chat API Error]: GROQ_API_KEY is not set");
            return new Response(
                JSON.stringify({ error: "API key not configured" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        // Build conversation with system prompt from persona selection
        const conversationMessages = systemPrompt
            ? [{ role: "system" as const, content: systemPrompt }, ...messages]
            : messages;

        let lastError: Error | null = null;

        // Try each model in priority order
        for (let i = 0; i < FALLBACK_MODELS.length; i++) {
            const modelId = FALLBACK_MODELS[i];

            try {
                console.log(`[Chat API]: Trying model ${i + 1}/${FALLBACK_MODELS.length}: ${modelId}`);

                // Create streaming completion
                const stream = await groq.chat.completions.create({
                    model: modelId,
                    messages: conversationMessages,
                    stream: true,
                });

                // Calculate prompt tokens from all messages
                const promptText = conversationMessages.map((m: { content: string }) => m.content).join(' ');
                const promptTokens = estimateTokenCount(promptText);
                let completionContent = '';

                // Create a readable stream for the response
                const encoder = new TextEncoder();
                const readableStream = new ReadableStream({
                    async start(controller) {
                        try {
                            for await (const chunk of stream) {
                                const content = chunk.choices[0]?.delta?.content || '';
                                if (content) {
                                    completionContent += content;
                                    // Format as Vercel AI SDK data stream format
                                    controller.enqueue(encoder.encode(`0:${JSON.stringify(content)}\n`));
                                }
                            }

                            // Save token usage after streaming completes
                            const completionTokens = estimateTokenCount(completionContent);
                            const tokenRecord: TokenUsageRecord = {
                                id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                                userId: userInfo.userId,
                                userName: userInfo.userName,
                                timestamp: new Date().toISOString(),
                                model: modelId,
                                promptTokens,
                                completionTokens,
                                totalTokens: promptTokens + completionTokens,
                                persona: persona || 'asisten-umum',
                            };

                            // Fire and forget, but handle promise rejection simply
                            saveTokenUsageRecord(tokenRecord).catch(e => console.error("Failed to save tokens", e));
                            console.log(`[Token Usage]: User ${userInfo.userId} used ${tokenRecord.totalTokens} tokens`);

                            controller.close();
                        } catch (error) {
                            controller.error(error);
                        }
                    },
                });

                console.log(`[Chat API]: Model ${modelId} succeeded`);

                return new Response(readableStream, {
                    headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                    },
                });
            } catch (error) {
                console.error(`[Chat API]: Model ${modelId} failed:`, error);
                lastError = error instanceof Error ? error : new Error(String(error));

                if (isRetryableError(error) && i < FALLBACK_MODELS.length - 1) {
                    console.log(`[Chat API]: Retryable error, trying next model...`);
                    continue;
                }

                throw error;
            }
        }

        throw lastError || new Error("All models exhausted");
    } catch (error) {
        console.error("[Chat API Error]:", error);

        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
