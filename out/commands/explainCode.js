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
exports.explainCodeCommand = void 0;
const vscode = __importStar(require("vscode"));
async function explainCodeCommand(apiClient) {
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
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('🥯 No active editor found. Please open a file first.');
            return;
        }
        // Get selected code or current line
        let code = '';
        let selection = editor.selection;
        if (selection.isEmpty) {
            // If no selection, use current line
            const currentLine = editor.document.lineAt(selection.active.line);
            code = currentLine.text.trim();
            selection = new vscode.Selection(currentLine.range.start, currentLine.range.end);
        }
        else {
            // Use selected text
            code = editor.document.getText(selection);
        }
        if (!code.trim()) {
            vscode.window.showErrorMessage('🥯 No code selected or current line is empty.');
            return;
        }
        const language = editor.document.languageId;
        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '🥯 Explaining code with BAGEL...',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Analyzing code...' });
            const response = await apiClient.explainCode({
                code,
                language,
                context: `File: ${editor.document.fileName}`
            });
            progress.report({ increment: 50, message: 'Processing explanation...' });
            if (response.success && response.data) {
                const explanation = response.data.explanation || response.data.text || response.data;
                // Create a new document with the explanation
                const explanationContent = `# Code Explanation\n\n## Original Code\n\`\`\`${language}\n${code}\n\`\`\`\n\n## Explanation\n\n${explanation}`;
                const doc = await vscode.workspace.openTextDocument({
                    content: explanationContent,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
                vscode.window.showInformationMessage('🥯 Code explanation generated!');
            }
            else {
                vscode.window.showErrorMessage(`🥯 Code explanation failed: ${response.error}`);
            }
            progress.report({ increment: 100, message: 'Complete!' });
        });
    }
    catch (error) {
        console.error('Explain code command error:', error);
        vscode.window.showErrorMessage(`🥯 Error explaining code: ${error}`);
    }
}
exports.explainCodeCommand = explainCodeCommand;
//# sourceMappingURL=explainCode.js.map