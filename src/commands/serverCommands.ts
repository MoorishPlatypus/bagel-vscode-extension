import * as vscode from 'vscode';
import { BagelServerManager } from '../utils/serverManager';

export async function startServerCommand(serverManager: BagelServerManager): Promise<void> {
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '🥯 Starting BAGEL server...',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Initializing server...' });

            const success = await serverManager.startServer();

            if (success) {
                progress.report({ increment: 100, message: 'Server started successfully!' });
                vscode.window.showInformationMessage('🥯 BAGEL server is now running!');
            } else {
                vscode.window.showErrorMessage('🥯 Failed to start BAGEL server. Check the output panel for details.');
            }
        });
    } catch (error) {
        console.error('Start server command error:', error);
        vscode.window.showErrorMessage(`🥯 Error starting server: ${error}`);
    }
}

export async function stopServerCommand(serverManager: BagelServerManager): Promise<void> {
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '🥯 Stopping BAGEL server...',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Shutting down server...' });

            const success = await serverManager.stopServer();

            if (success) {
                progress.report({ increment: 100, message: 'Server stopped successfully!' });
                vscode.window.showInformationMessage('🥯 BAGEL server has been stopped.');
            } else {
                vscode.window.showWarningMessage('🥯 Server may not have been running or failed to stop properly.');
            }
        });
    } catch (error) {
        console.error('Stop server command error:', error);
        vscode.window.showErrorMessage(`🥯 Error stopping server: ${error}`);
    }
}