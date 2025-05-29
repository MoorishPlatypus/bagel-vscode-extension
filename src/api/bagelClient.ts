import axios, { AxiosInstance } from 'axios';
import * as vscode from 'vscode';

export interface BagelResponse {
    success: boolean;
    data?: any;
    error?: string;
}

export interface CodeGenerationRequest {
    prompt: string;
    language?: string;
    context?: string;
    maxTokens?: number;
    temperature?: number;
}

export interface CodeExplanationRequest {
    code: string;
    language?: string;
    context?: string;
}

export interface ImageGenerationRequest {
    prompt: string;
    width?: number;
    height?: number;
    steps?: number;
}

export interface ChatRequest {
    message: string;
    context?: string;
    conversationId?: string;
}

export class BagelApiClient {
    private client: AxiosInstance;
    private baseUrl: string = 'http://localhost:12000';

    constructor() {
        this.updateConfiguration();
        this.client = axios.create({
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('bagel.serverUrl')) {
                this.updateConfiguration();
            }
        });
    }

    private updateConfiguration() {
        const config = vscode.workspace.getConfiguration('bagel');
        this.baseUrl = config.get('serverUrl', 'http://localhost:12000');
        if (this.client) {
            this.client.defaults.baseURL = this.baseUrl;
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            const response = await this.client.get('/health');
            return response.status === 200;
        } catch (error) {
            console.error('BAGEL health check failed:', error);
            return false;
        }
    }

    async generateCode(request: CodeGenerationRequest): Promise<BagelResponse> {
        try {
            const config = vscode.workspace.getConfiguration('bagel');
            const payload = {
                ...request,
                maxTokens: request.maxTokens || config.get('maxTokens', 2048),
                temperature: request.temperature || config.get('temperature', 0.7)
            };

            const response = await this.client.post('/generate-code', payload);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Code generation failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }

    async explainCode(request: CodeExplanationRequest): Promise<BagelResponse> {
        try {
            const response = await this.client.post('/explain-code', request);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Code explanation failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }

    async optimizeCode(request: CodeExplanationRequest): Promise<BagelResponse> {
        try {
            const response = await this.client.post('/optimize-code', request);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Code optimization failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }

    async generateImage(request: ImageGenerationRequest): Promise<BagelResponse> {
        try {
            const response = await this.client.post('/generate-image', request);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Image generation failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }

    async chat(request: ChatRequest): Promise<BagelResponse> {
        try {
            const response = await this.client.post('/chat', request);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Chat request failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }

    async uploadImage(imageData: Buffer, filename: string): Promise<BagelResponse> {
        try {
            // Note: This is a simplified implementation for Node.js environment
            // In a real browser environment, you would use FormData and Blob
            const payload = {
                image_data: imageData.toString('base64'),
                filename: filename
            };

            const response = await this.client.post('/upload-image', payload);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Image upload failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }

    getServerUrl(): string {
        return this.baseUrl;
    }
}