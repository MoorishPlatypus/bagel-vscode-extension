"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BagelApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const vscode = __importStar(require("vscode"));
class BagelApiClient {
    constructor() {
        this.baseUrl = 'http://localhost:12000';
        this.updateConfiguration();
        this.client = axios_1.default.create({
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
    updateConfiguration() {
        const config = vscode.workspace.getConfiguration('bagel');
        this.baseUrl = config.get('serverUrl', 'http://localhost:12000');
        if (this.client) {
            this.client.defaults.baseURL = this.baseUrl;
        }
    }
    async checkHealth() {
        try {
            const response = await this.client.get('/health');
            return response.status === 200;
        }
        catch (error) {
            console.error('BAGEL health check failed:', error);
            return false;
        }
    }
    async generateCode(request) {
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
        }
        catch (error) {
            console.error('Code generation failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }
    async explainCode(request) {
        try {
            const response = await this.client.post('/explain-code', request);
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Code explanation failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }
    async optimizeCode(request) {
        try {
            const response = await this.client.post('/optimize-code', request);
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Code optimization failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }
    async generateImage(request) {
        try {
            const response = await this.client.post('/generate-image', request);
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Image generation failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }
    async chat(request) {
        try {
            const response = await this.client.post('/chat', request);
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Chat request failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }
    async uploadImage(imageData, filename) {
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
        }
        catch (error) {
            console.error('Image upload failed:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }
    getServerUrl() {
        return this.baseUrl;
    }
}
exports.BagelApiClient = BagelApiClient;
//# sourceMappingURL=bagelClient.js.map