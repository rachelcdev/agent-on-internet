import type { AgentRequest, AgentResponse, GoogleAIRequest, GoogleAIResponse, Env } from './types';

/**
 * Core Agent class that handles task processing using Google AI
 */
export class Agent {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = 'gemini-2.5-flash') {
        this.apiKey = apiKey;
        this.model = model;
    }

    /**
     * Process a task using Google AI
     */
    async processTask(request: AgentRequest): Promise<AgentResponse> {
        const startTime = new Date().toISOString();

        try {
            // Use the model from request if provided, otherwise use default
            const modelToUse = request.model || this.model;

            // Build the prompt
            const prompt = this.buildPrompt(request.task, request.context);

            // Call Google AI API
            const aiResponse = await this.callGoogleAI(prompt, modelToUse);

            return {
                success: true,
                result: aiResponse.text,
                timestamp: startTime,
                model: modelToUse,
                tokensUsed: aiResponse.tokensUsed,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                timestamp: startTime,
            };
        }
    }

    /**
     * Build a prompt for the AI based on the task and context
     */
    private buildPrompt(task: string, context?: string): string {
        if (context) {
            return `Context: ${context}\n\nTask: ${task}\n\nPlease provide a helpful and concise response.`;
        }
        return task;
    }

    /**
     * Call Google AI API (Gemini)
     */
    private async callGoogleAI(
        prompt: string,
        model: string
    ): Promise<{ text: string; tokensUsed?: number }> {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

        const requestBody: GoogleAIRequest = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
                topP: 0.95,
                topK: 40,
            },
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google AI API error (${response.status}): ${errorText}`);
        }

        const data = (await response.json()) as GoogleAIResponse;

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response from Google AI');
        }

        const text = data.candidates[0].content.parts[0].text;
        const tokensUsed = data.usageMetadata?.totalTokenCount;

        return { text, tokensUsed };
    }

    /**
     * Simple rule-based fallback (when no API key is provided)
     */
    static async processFallback(request: AgentRequest): Promise<AgentResponse> {
        const startTime = new Date().toISOString();

        // Simple rule-based responses
        const task = request.task.toLowerCase();

        let result: string;

        if (task.includes('hello') || task.includes('hi')) {
            result = "Hello! I'm a task automation agent. I can help you with various tasks when configured with Google AI API.";
        } else if (task.includes('time')) {
            result = `The current timestamp is: ${startTime}`;
        } else if (task.includes('help') || task.includes('what can you do')) {
            result = `I'm an AI agent that can:
- Answer questions
- Process tasks
- Provide assistance

To unlock full AI capabilities, configure the GOOGLE_AI_API_KEY secret.`;
        } else {
            result = `Received task: "${request.task}". To process this with AI, please configure the GOOGLE_AI_API_KEY secret.`;
        }

        return {
            success: true,
            result,
            timestamp: startTime,
            model: 'fallback',
        };
    }
}
