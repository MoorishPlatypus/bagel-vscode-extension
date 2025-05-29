import * as vscode from 'vscode';
import { BagelApiClient } from '../api/bagelClient';

export async function explainCodeCommand(apiClient: BagelApiClient): Promise<void> {
    try {
        // Check if BAGEL server is running
        const isHealthy = await apiClient.checkHealth();
        if (!isHealthy) {
            const action = await vscode.window.showErrorMessage(
                '🥯 BAGEL server is not running. Please start the server first.',
                'Start Server'
            );
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
        } else {
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
            } else {
                vscode.window.showErrorMessage(`🥯 Code explanation failed: ${response.error}`);
            }

            progress.report({ increment: 100, message: 'Complete!' });
        });

    } catch (error) {
        console.error('Explain code command error:', error);
        vscode.window.showErrorMessage(`🥯 Error explaining code: ${error}`);
    }
}