import * as vscode from 'vscode';
import { BagelApiClient } from '../api/bagelClient';

export async function optimizeCodeCommand(apiClient: BagelApiClient): Promise<void> {
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

        // Get selected code
        let code = '';
        let selection = editor.selection;

        if (selection.isEmpty) {
            vscode.window.showErrorMessage('🥯 Please select the code you want to optimize.');
            return;
        }

        code = editor.document.getText(selection);
        if (!code.trim()) {
            vscode.window.showErrorMessage('🥯 Selected code is empty.');
            return;
        }

        const language = editor.document.languageId;

        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '🥯 Optimizing code with BAGEL...',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Analyzing code for optimization...' });

            const response = await apiClient.optimizeCode({
                code,
                language,
                context: `File: ${editor.document.fileName}`
            });

            progress.report({ increment: 50, message: 'Generating optimized version...' });

            if (response.success && response.data) {
                const optimizedCode = response.data.optimized_code || response.data.code || response.data.text || response.data;
                const explanation = response.data.explanation || 'Code has been optimized for better performance and readability.';
                
                // Show diff view
                const originalUri = vscode.Uri.parse(`untitled:Original Code.${language}`);
                const optimizedUri = vscode.Uri.parse(`untitled:Optimized Code.${language}`);
                
                // Create temporary documents
                const originalDoc = await vscode.workspace.openTextDocument(originalUri.with({ 
                    scheme: 'untitled',
                    path: `Original Code.${language}`
                }));
                
                const optimizedDoc = await vscode.workspace.openTextDocument(optimizedUri.with({
                    scheme: 'untitled', 
                    path: `Optimized Code.${language}`
                }));

                // Set content
                const originalEdit = new vscode.WorkspaceEdit();
                originalEdit.insert(originalDoc.uri, new vscode.Position(0, 0), code);
                await vscode.workspace.applyEdit(originalEdit);

                const optimizedEdit = new vscode.WorkspaceEdit();
                optimizedEdit.insert(optimizedDoc.uri, new vscode.Position(0, 0), optimizedCode);
                await vscode.workspace.applyEdit(optimizedEdit);

                // Show diff
                await vscode.commands.executeCommand('vscode.diff', 
                    originalDoc.uri, 
                    optimizedDoc.uri, 
                    'Original ↔ Optimized (BAGEL)'
                );

                // Ask user if they want to replace the original code
                const action = await vscode.window.showInformationMessage(
                    `🥯 Code optimization complete!\n\n${explanation}`,
                    'Replace Original',
                    'Keep Both',
                    'Cancel'
                );

                if (action === 'Replace Original') {
                    await editor.edit(editBuilder => {
                        editBuilder.replace(selection, optimizedCode);
                    });
                    vscode.window.showInformationMessage('🥯 Original code replaced with optimized version!');
                }
            } else {
                vscode.window.showErrorMessage(`🥯 Code optimization failed: ${response.error}`);
            }

            progress.report({ increment: 100, message: 'Complete!' });
        });

    } catch (error) {
        console.error('Optimize code command error:', error);
        vscode.window.showErrorMessage(`🥯 Error optimizing code: ${error}`);
    }
}