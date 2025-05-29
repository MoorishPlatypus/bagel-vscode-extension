import * as vscode from 'vscode';
import { BagelChatProvider } from '../providers/chatProvider';

export async function openChatCommand(chatProvider: BagelChatProvider): Promise<void> {
    try {
        // Focus on the BAGEL chat view
        await vscode.commands.executeCommand('bagelChat.focus');
        
        // If the chat view is not visible, show it
        await vscode.commands.executeCommand('workbench.view.explorer');
        
        // Create and show the chat webview
        chatProvider.showChatWebview();
        
        vscode.window.showInformationMessage('🥯 BAGEL Chat is now open!');
    } catch (error) {
        console.error('Open chat command error:', error);
        vscode.window.showErrorMessage(`🥯 Error opening chat: ${error}`);
    }
}