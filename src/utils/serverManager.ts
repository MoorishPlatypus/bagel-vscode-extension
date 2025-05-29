import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';

export class BagelServerManager {
    private serverProcess: ChildProcess | undefined;
    private outputChannel: vscode.OutputChannel;
    private isServerRunning = false;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('BAGEL Server');
    }

    async startServer(): Promise<boolean> {
        if (this.isServerRunning) {
            this.outputChannel.appendLine('BAGEL server is already running');
            return true;
        }

        try {
            // Find the BAGEL server script
            const serverScript = this.findBagelServer();
            if (!serverScript) {
                this.outputChannel.appendLine('BAGEL server script not found. Please ensure BAGEL is installed.');
                return false;
            }

            this.outputChannel.appendLine(`Starting BAGEL server from: ${serverScript}`);
            this.outputChannel.show();

            // Get configuration
            const config = vscode.workspace.getConfiguration('bagel');
            const serverUrl = config.get('serverUrl', 'http://localhost:12000');
            const port = this.extractPortFromUrl(serverUrl);

            // Start the server process
            this.serverProcess = spawn('python', [serverScript, '--port', port.toString()], {
                cwd: path.dirname(serverScript),
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // Handle server output
            this.serverProcess.stdout?.on('data', (data) => {
                this.outputChannel.appendLine(`[STDOUT] ${data.toString()}`);
            });

            this.serverProcess.stderr?.on('data', (data) => {
                this.outputChannel.appendLine(`[STDERR] ${data.toString()}`);
            });

            this.serverProcess.on('close', (code) => {
                this.outputChannel.appendLine(`BAGEL server process exited with code ${code}`);
                this.isServerRunning = false;
                this.serverProcess = undefined;
            });

            this.serverProcess.on('error', (error) => {
                this.outputChannel.appendLine(`BAGEL server error: ${error.message}`);
                this.isServerRunning = false;
                this.serverProcess = undefined;
            });

            // Wait a moment for the server to start
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Check if server is responding
            const isHealthy = await this.checkServerHealth(serverUrl);
            if (isHealthy) {
                this.isServerRunning = true;
                this.outputChannel.appendLine('BAGEL server started successfully!');
                return true;
            } else {
                this.outputChannel.appendLine('BAGEL server failed to start or is not responding');
                this.stopServer();
                return false;
            }

        } catch (error) {
            this.outputChannel.appendLine(`Error starting BAGEL server: ${error}`);
            return false;
        }
    }

    async stopServer(): Promise<boolean> {
        if (!this.serverProcess || !this.isServerRunning) {
            this.outputChannel.appendLine('BAGEL server is not running');
            return true;
        }

        try {
            this.outputChannel.appendLine('Stopping BAGEL server...');
            
            // Try graceful shutdown first
            this.serverProcess.kill('SIGTERM');
            
            // Wait for graceful shutdown
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Force kill if still running
            if (this.serverProcess && !this.serverProcess.killed) {
                this.serverProcess.kill('SIGKILL');
            }

            this.isServerRunning = false;
            this.serverProcess = undefined;
            this.outputChannel.appendLine('BAGEL server stopped');
            return true;

        } catch (error) {
            this.outputChannel.appendLine(`Error stopping BAGEL server: ${error}`);
            return false;
        }
    }

    private findBagelServer(): string | undefined {
        // Look for BAGEL server in common locations
        const possiblePaths = [
            // In the extension's bundled server
            path.join(__dirname, '..', '..', 'bagel-server', 'server.py'),
            // In workspace
            ...(vscode.workspace.workspaceFolders?.map(folder => 
                path.join(folder.uri.fsPath, 'bagel-server', 'server.py')
            ) || []),
            // In the BAGEL repository if cloned
            path.join(process.cwd(), 'BAGEL', 'app.py'),
            path.join(process.cwd(), 'bagel-server', 'server.py'),
            // Check if there's a BAGEL installation
            path.join(process.env.HOME || '', '.bagel', 'server.py')
        ];

        for (const serverPath of possiblePaths) {
            if (fs.existsSync(serverPath)) {
                return serverPath;
            }
        }

        // If not found, create a basic server
        return this.createBasicServer();
    }

    private createBasicServer(): string {
        const serverDir = path.join(__dirname, '..', '..', 'bagel-server');
        const serverPath = path.join(serverDir, 'server.py');

        // Create directory if it doesn't exist
        if (!fs.existsSync(serverDir)) {
            fs.mkdirSync(serverDir, { recursive: true });
        }

        // Create a basic BAGEL server if it doesn't exist
        if (!fs.existsSync(serverPath)) {
            const serverCode = this.getBasicServerCode();
            fs.writeFileSync(serverPath, serverCode);
            
            // Create requirements.txt
            const requirementsPath = path.join(serverDir, 'requirements.txt');
            const requirements = `flask==2.3.3
flask-cors==4.0.0
requests==2.31.0
torch>=2.0.0
transformers>=4.30.0
pillow>=9.5.0
numpy>=1.24.0`;
            fs.writeFileSync(requirementsPath, requirements);
        }

        return serverPath;
    }

    private getBasicServerCode(): string {
        return `#!/usr/bin/env python3
"""
Basic BAGEL API Server for VS Code Extension
This is a simplified server that provides the basic API endpoints.
For full BAGEL functionality, please use the official BAGEL repository.
"""

import argparse
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "BAGEL server is running"})

@app.route('/generate-code', methods=['POST'])
def generate_code():
    """Generate code endpoint"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        language = data.get('language', 'python')
        
        # This is a placeholder response
        # In a real implementation, this would use the BAGEL model
        response_code = f"""# Generated code for: {prompt}
# Language: {language}
# This is a placeholder implementation

def example_function():
    '''
    {prompt}
    '''
    # TODO: Implement the actual functionality
    pass
"""
        
        return jsonify({
            "code": response_code,
            "explanation": f"Generated {language} code based on the prompt: {prompt}"
        })
        
    except Exception as e:
        logger.error(f"Error in generate_code: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/explain-code', methods=['POST'])
def explain_code():
    """Explain code endpoint"""
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'unknown')
        
        # This is a placeholder response
        explanation = f"""This {language} code appears to:

1. Define functionality related to the provided code snippet
2. Use standard {language} syntax and conventions
3. Implement logic that would need to be analyzed by the full BAGEL model

Note: This is a basic explanation. For detailed AI-powered analysis, 
please install the full BAGEL model and server.
"""
        
        return jsonify({
            "explanation": explanation,
            "language": language,
            "complexity": "medium"
        })
        
    except Exception as e:
        logger.error(f"Error in explain_code: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/optimize-code', methods=['POST'])
def optimize_code():
    """Optimize code endpoint"""
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'unknown')
        
        # This is a placeholder response
        optimized_code = f"""# Optimized version of the code
# Original code has been analyzed and improved

{code}

# Note: This is a placeholder optimization
# For real optimization, use the full BAGEL model
"""
        
        return jsonify({
            "optimized_code": optimized_code,
            "explanation": "Code has been analyzed for potential optimizations. This is a placeholder response.",
            "improvements": ["Added comments", "Maintained original functionality"]
        })
        
    except Exception as e:
        logger.error(f"Error in optimize_code: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    """Chat endpoint"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        context = data.get('context', '')
        
        # This is a placeholder response
        response = f"""Thank you for your message: "{message}"

I'm a basic BAGEL server placeholder. For full AI capabilities including:
- Advanced code generation
- Multimodal understanding
- Image generation and editing
- Intelligent conversations

Please install the full BAGEL model from: https://github.com/bytedance-seed/BAGEL

Context received: {context[:100]}{'...' if len(context) > 100 else ''}
"""
        
        return jsonify({
            "response": response,
            "conversation_id": data.get('conversationId', 'default')
        })
        
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-image', methods=['POST'])
def generate_image():
    """Generate image endpoint"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        
        # This is a placeholder response
        return jsonify({
            "message": "Image generation requires the full BAGEL model",
            "prompt": prompt,
            "note": "Please install BAGEL from https://github.com/bytedance-seed/BAGEL for image generation"
        })
        
    except Exception as e:
        logger.error(f"Error in generate_image: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='BAGEL API Server')
    parser.add_argument('--port', type=int, default=12000, help='Port to run the server on')
    parser.add_argument('--host', type=str, default='localhost', help='Host to run the server on')
    args = parser.parse_args()
    
    logger.info(f"Starting BAGEL server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=False)
`;
    }

    private extractPortFromUrl(url: string): number {
        try {
            const urlObj = new URL(url);
            return parseInt(urlObj.port) || 12000;
        } catch {
            return 12000;
        }
    }

    private async checkServerHealth(serverUrl: string): Promise<boolean> {
        try {
            // Use node's built-in http module to check health
            const http = require('http');
            const url = new URL(serverUrl + '/health');
            
            return new Promise((resolve) => {
                const req = http.get({
                    hostname: url.hostname,
                    port: url.port,
                    path: '/health',
                    timeout: 5000
                }, (res: any) => {
                    resolve(res.statusCode === 200);
                });
                
                req.on('error', () => resolve(false));
                req.on('timeout', () => {
                    req.destroy();
                    resolve(false);
                });
            });
        } catch {
            return false;
        }
    }

    isRunning(): boolean {
        return this.isServerRunning;
    }

    getOutputChannel(): vscode.OutputChannel {
        return this.outputChannel;
    }
}