/**
 * Type definitions for the Agent API
 */

export interface Env {
    // Google AI API key (set via: wrangler secret put GOOGLE_AI_API_KEY)
    GOOGLE_AI_API_KEY?: string;

    // Optional KV namespace for storing agent state
    AGENT_KV?: KVNamespace;
}

export interface AgentRequest {
    task: string;
    context?: string;
    model?: 'gemini-pro' | 'gemini-1.5-flash' | 'gemini-1.5-pro';
}

export interface AgentResponse {
    success: boolean;
    result?: string;
    error?: string;
    timestamp: string;
    model?: string;
    tokensUsed?: number;
}

export interface GoogleAIRequest {
    contents: {
        parts: {
            text: string;
        }[];
    }[];
    generationConfig?: {
        temperature?: number;
        maxOutputTokens?: number;
        topP?: number;
        topK?: number;
    };
}

export interface GoogleAIResponse {
    candidates: {
        content: {
            parts: {
                text: string;
            }[];
            role: string;
        };
        finishReason: string;
        index: number;
    }[];
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}
