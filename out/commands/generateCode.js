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
exports.generateCodeCommand = void 0;
const vscode = __importStar(require("vscode"));
async function generateCodeCommand(apiClient) {
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
        // Get user input
        const prompt = await vscode.window.showInputBox({
            prompt: 'Describe the code you want to generate',
            placeHolder: 'e.g., "Create a function that sorts an array of numbers"',
            ignoreFocusOut: true
        });
        if (!prompt) {
            return;
        }
        // Get current editor context
        const editor = vscode.window.activeTextEditor;
        let language = 'javascript'; // default
        let context = '';
        if (editor) {
            language = editor.document.languageId;
            // Get surrounding context (previous 10 lines)
            const currentLine = editor.selection.active.line;
            const startLine = Math.max(0, currentLine - 10);
            const endLine = Math.min(editor.document.lineCount - 1, currentLine + 10);
            const range = new vscode.Range(startLine, 0, endLine, editor.document.lineAt(endLine).text.length);
            context = editor.document.getText(range);
        }
        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '🥯 Generating code with BAGEL...',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Sending request to BAGEL...' });
            const response = await apiClient.generateCode({
                prompt,
                language,
                context
            });
            progress.report({ increment: 50, message: 'Processing response...' });
            if (response.success && response.data) {
                const generatedCode = response.data.code || response.data.text || response.data;
                if (editor) {
                    // Insert generated code at cursor position
                    const position = editor.selection.active;
                    await editor.edit(editBuilder => {
                        editBuilder.insert(position, generatedCode);
                    });
                    // Show success message
                    vscode.window.showInformationMessage('🥯 Code generated successfully!');
                }
                else {
                    // Create new document with generated code
                    const doc = await vscode.workspace.openTextDocument({
                        content: generatedCode,
                        language: language
                    });
                    await vscode.window.showTextDocument(doc);
                    vscode.window.showInformationMessage('🥯 Code generated in new document!');
                }
            }
            else {
                vscode.window.showErrorMessage(`🥯 Code generation failed: ${response.error}`);
            }
            progress.report({ increment: 100, message: 'Complete!' });
        });
    }
    catch (error) {
        console.error('Generate code command error:', error);
        vscode.window.showErrorMessage(`🥯 Error generating code: ${error}`);
    }
}
exports.generateCodeCommand = generateCodeCommand;
//# sourceMappingURL=generateCode.js.map