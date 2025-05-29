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
exports.BagelCodeActionsProvider = void 0;
const vscode = __importStar(require("vscode"));
class BagelCodeActionsProvider {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    async provideCodeActions(document, range, context, token) {
        const actions = [];
        // Only provide actions if there's selected text or we're on a line with content
        const selectedText = document.getText(range);
        const hasSelection = !range.isEmpty;
        const currentLine = document.lineAt(range.start.line);
        const hasContent = currentLine.text.trim().length > 0;
        if (!hasSelection && !hasContent) {
            return actions;
        }
        // BAGEL Explain Code Action
        if (hasSelection || hasContent) {
            const explainAction = new vscode.CodeAction('🥯 Explain with BAGEL', vscode.CodeActionKind.QuickFix);
            explainAction.command = {
                command: 'bagel.explainCode',
                title: 'Explain Code with BAGEL'
            };
            explainAction.isPreferred = false;
            actions.push(explainAction);
        }
        // BAGEL Optimize Code Action (only for selections)
        if (hasSelection) {
            const optimizeAction = new vscode.CodeAction('🥯 Optimize with BAGEL', vscode.CodeActionKind.Refactor);
            optimizeAction.command = {
                command: 'bagel.optimizeCode',
                title: 'Optimize Code with BAGEL'
            };
            optimizeAction.isPreferred = false;
            actions.push(optimizeAction);
        }
        // BAGEL Generate Code Action
        const generateAction = new vscode.CodeAction('🥯 Generate Code with BAGEL', vscode.CodeActionKind.QuickFix);
        generateAction.command = {
            command: 'bagel.generateCode',
            title: 'Generate Code with BAGEL'
        };
        generateAction.isPreferred = false;
        actions.push(generateAction);
        // BAGEL Chat Action
        const chatAction = new vscode.CodeAction('🥯 Ask BAGEL AI', vscode.CodeActionKind.QuickFix);
        chatAction.command = {
            command: 'bagel.openChat',
            title: 'Open BAGEL Chat'
        };
        chatAction.isPreferred = false;
        actions.push(chatAction);
        // Add diagnostic-specific actions if there are diagnostics
        if (context.diagnostics && context.diagnostics.length > 0) {
            const fixAction = new vscode.CodeAction('🥯 Fix with BAGEL AI', vscode.CodeActionKind.QuickFix);
            // Create a command that will analyze the diagnostic and suggest a fix
            fixAction.command = {
                command: 'bagel.fixDiagnostic',
                title: 'Fix with BAGEL AI',
                arguments: [document, range, context.diagnostics]
            };
            fixAction.isPreferred = true; // Make this the preferred quick fix
            actions.push(fixAction);
        }
        return actions;
    }
    // Helper method to register the fix diagnostic command
    static registerFixDiagnosticCommand(context, apiClient) {
        const disposable = vscode.commands.registerCommand('bagel.fixDiagnostic', async (document, range, diagnostics) => {
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
                const problemCode = document.getText(range);
                const diagnosticMessages = diagnostics.map(d => `${d.severity === vscode.DiagnosticSeverity.Error ? 'Error' : 'Warning'}: ${d.message}`).join('\n');
                const prompt = `Fix the following code issues:\n\nCode:\n\`\`\`${document.languageId}\n${problemCode}\n\`\`\`\n\nIssues:\n${diagnosticMessages}\n\nPlease provide the corrected code.`;
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: '🥯 Fixing code with BAGEL AI...',
                    cancellable: false
                }, async (progress) => {
                    progress.report({ increment: 0, message: 'Analyzing issues...' });
                    const response = await apiClient.generateCode({
                        prompt: prompt,
                        language: document.languageId,
                        context: `File: ${document.fileName}`
                    });
                    progress.report({ increment: 50, message: 'Generating fix...' });
                    if (response.success && response.data) {
                        const fixedCode = response.data.code || response.data.text || response.data;
                        // Apply the fix
                        const editor = vscode.window.activeTextEditor;
                        if (editor && editor.document === document) {
                            await editor.edit(editBuilder => {
                                editBuilder.replace(range, fixedCode);
                            });
                            vscode.window.showInformationMessage('🥯 Code fixed with BAGEL AI!');
                        }
                    }
                    else {
                        vscode.window.showErrorMessage(`🥯 Failed to fix code: ${response.error}`);
                    }
                    progress.report({ increment: 100, message: 'Complete!' });
                });
            }
            catch (error) {
                console.error('Fix diagnostic error:', error);
                vscode.window.showErrorMessage(`🥯 Error fixing code: ${error}`);
            }
        });
        context.subscriptions.push(disposable);
    }
}
exports.BagelCodeActionsProvider = BagelCodeActionsProvider;
//# sourceMappingURL=codeActionsProvider.js.map