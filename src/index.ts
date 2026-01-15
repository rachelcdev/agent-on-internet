import { Agent } from './agent';
import type { AgentRequest, AgentResponse, Env } from './types';

/**
 * Cloudflare Workers entry point
 */
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        // Enable CORS
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: corsHeaders,
            });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // Health check endpoint
            if (path === '/health' || path === '/') {
                return jsonResponse(
                    {
                        status: 'healthy',
                        message: 'Agent is running',
                        timestamp: new Date().toISOString(),
                        hasApiKey: !!env.GOOGLE_AI_API_KEY,
                    },
                    200,
                    corsHeaders
                );
            }

            // Agent endpoint
            if (path === '/agent' && request.method === 'POST') {
                const agentRequest = (await request.json()) as AgentRequest;

                // Validate request
                if (!agentRequest.task || typeof agentRequest.task !== 'string') {
                    return jsonResponse(
                        {
                            success: false,
                            error: 'Invalid request: "task" field is required',
                        },
                        400,
                        corsHeaders
                    );
                }

                let response: AgentResponse;

                // Process with Google AI if API key is configured
                if (env.GOOGLE_AI_API_KEY) {
                    const agent = new Agent(env.GOOGLE_AI_API_KEY);
                    response = await agent.processTask(agentRequest);
                } else {
                    // Use fallback logic
                    response = await Agent.processFallback(agentRequest);
                }

                return jsonResponse(response, 200, corsHeaders);
            }

            // Info endpoint
            if (path === '/info') {
                return jsonResponse(
                    {
                        name: 'Agent on Internet',
                        version: '1.0.0',
                        description: 'AI Task Automation Agent powered by Google AI',
                        endpoints: {
                            '/': 'Health check',
                            '/health': 'Health check',
                            '/agent': 'POST - Process a task',
                            '/info': 'GET - API information',
                        },
                        exampleRequest: {
                            endpoint: '/agent',
                            method: 'POST',
                            body: {
                                task: 'What is the capital of France?',
                                context: 'Optional context information',
                                model: 'gemini-1.5-flash',
                            },
                        },
                    },
                    200,
                    corsHeaders
                );
            }

            // 404 for unknown routes
            return jsonResponse(
                {
                    success: false,
                    error: 'Not found',
                    availableEndpoints: ['/', '/health', '/agent', '/info'],
                },
                404,
                corsHeaders
            );
        } catch (error) {
            console.error('Error processing request:', error);
            return jsonResponse(
                {
                    success: false,
                    error: error instanceof Error ? error.message : 'Internal server error',
                },
                500,
                corsHeaders
            );
        }
    },
};

/**
 * Helper function to create JSON responses
 */
function jsonResponse(data: unknown, status: number = 200, additionalHeaders: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...additionalHeaders,
        },
    });
}
