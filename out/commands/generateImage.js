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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImageCommand = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
async function generateImageCommand(apiClient) {
    try {
        // Check if BAGEL server is running
        const isHealthy = await apiClient.checkHealth();
        if (!isHealthy) {
            const action = await vscode.window.showErrorMessage('🥯 BAGEL server is not running. Please start the server first.', 'Start Server');
            if (action === 'Start Server') {
                vscode.commands.executeCommand('bagel.startServer');
            }
            return;
        }
        // Get user input for image prompt
        const prompt = await vscode.window.showInputBox({
            prompt: 'Describe the image you want to generate',
            placeHolder: 'e.g., "A futuristic robot coding on a computer"',
            ignoreFocusOut: true
        });
        if (!prompt) {
            return;
        }
        // Get image dimensions
        const sizeOptions = [
            { label: '512x512 (Square)', value: { width: 512, height: 512 } },
            { label: '768x512 (Landscape)', value: { width: 768, height: 512 } },
            { label: '512x768 (Portrait)', value: { width: 512, height: 768 } },
            { label: '1024x1024 (Large Square)', value: { width: 1024, height: 1024 } }
        ];
        const selectedSize = await vscode.window.showQuickPick(sizeOptions, {
            placeHolder: 'Select image size'
        });
        if (!selectedSize) {
            return;
        }
        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '🥯 Generating image with BAGEL...',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Sending request to BAGEL...' });
            const response = await apiClient.generateImage({
                prompt,
                width: selectedSize.value.width,
                height: selectedSize.value.height,
                steps: 50
            });
            progress.report({ increment: 70, message: 'Processing generated image...' });
            if (response.success && response.data) {
                // Handle different response formats
                let imageData;
                let filename = `bagel_generated_${Date.now()}.png`;
                if (response.data.image_base64) {
                    // Base64 encoded image
                    imageData = Buffer.from(response.data.image_base64, 'base64');
                }
                else if (response.data.image_url) {
                    // Image URL - would need to download
                    vscode.window.showInformationMessage(`🥯 Image generated! URL: ${response.data.image_url}`);
                    return;
                }
                else if (response.data.image_path) {
                    // Local file path
                    const imagePath = response.data.image_path;
                    if (fs.existsSync(imagePath)) {
                        // Open the image file
                        const imageUri = vscode.Uri.file(imagePath);
                        await vscode.commands.executeCommand('vscode.open', imageUri);
                        vscode.window.showInformationMessage('🥯 Image generated and opened!');
                        return;
                    }
                }
                else {
                    vscode.window.showErrorMessage('🥯 Unexpected response format from BAGEL server');
                    return;
                }
                if (!imageData) {
                    vscode.window.showErrorMessage('🥯 No image data received from server');
                    return;
                }
                // Save image to workspace or temp directory
                let saveDir;
                if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                    saveDir = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'bagel_images');
                }
                else {
                    saveDir = path.join(require('os').tmpdir(), 'bagel_images');
                }
                // Create directory if it doesn't exist
                if (!fs.existsSync(saveDir)) {
                    fs.mkdirSync(saveDir, { recursive: true });
                }
                const imagePath = path.join(saveDir, filename);
                if (imageData instanceof Buffer) {
                    fs.writeFileSync(imagePath, imageData);
                }
                else {
                    // Assume base64 string
                    fs.writeFileSync(imagePath, imageData, 'base64');
                }
                // Open the generated image
                const imageUri = vscode.Uri.file(imagePath);
                await vscode.commands.executeCommand('vscode.open', imageUri);
                vscode.window.showInformationMessage(`🥯 Image generated and saved to: ${imagePath}`);
            }
            else {
                vscode.window.showErrorMessage(`🥯 Image generation failed: ${response.error}`);
            }
            progress.report({ increment: 100, message: 'Complete!' });
        });
    }
    catch (error) {
        console.error('Generate image command error:', error);
        vscode.window.showErrorMessage(`🥯 Error generating image: ${error}`);
    }
}
exports.generateImageCommand = generateImageCommand;
//# sourceMappingURL=generateImage.js.map