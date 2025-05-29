import * as vscode from 'vscode';
import { BagelApiClient } from './api/bagelClient';
import { BagelChatProvider } from './providers/chatProvider';
import { BagelHoverProvider } from './providers/hoverProvider';
import { BagelCodeActionsProvider } from './providers/codeActionsProvider';
import { generateCodeCommand } from './commands/generateCode';
import { explainCodeCommand } from './commands/explainCode';
import { optimizeCodeCommand } from './commands/optimizeCode';
import { openChatCommand } from './commands/openChat';
import { generateImageCommand } from './commands/generateImage';
import { startServerCommand, stopServerCommand } from './commands/serverCommands';
import { BagelServerManager } from './utils/serverManager';

let bagelApiClient: BagelApiClient;
let serverManager: BagelServerManager;
let chatProvider: BagelChatProvider;

export async function activate(context: vscode.ExtensionContext) {
    console.log('🥯 BAGEL AI Extension is now active!');

    // Initialize components
    bagelApiClient = new BagelApiClient();
    serverManager = new BagelServerManager();
    chatProvider = new BagelChatProvider(context, bagelApiClient);

    // Set context for when BAGEL is enabled
    vscode.commands.executeCommand('setContext', 'bagel.enabled', true);

    // Register commands
    const commands = [
        vscode.commands.registerCommand('bagel.generateCode', () => generateCodeCommand(bagelApiClient)),
        vscode.commands.registerCommand('bagel.explainCode', () => explainCodeCommand(bagelApiClient)),
        vscode.commands.registerCommand('bagel.optimizeCode', () => optimizeCodeCommand(bagelApiClient)),
        vscode.commands.registerCommand('bagel.openChat', () => openChatCommand(chatProvider)),
        vscode.commands.registerCommand('bagel.generateImage', () => generateImageCommand(bagelApiClient)),
        vscode.commands.registerCommand('bagel.startServer', () => startServerCommand(serverManager)),
        vscode.commands.registerCommand('bagel.stopServer', () => stopServerCommand(serverManager))
    ];

    // Register providers
    const providers = [
        vscode.languages.registerHoverProvider('*', new BagelHoverProvider(bagelApiClient)),
        vscode.languages.registerCodeActionsProvider('*', new BagelCodeActionsProvider(), {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.Refactor]
        }),
        vscode.window.registerTreeDataProvider('bagelChat', chatProvider)
    ];

    // Register the fix diagnostic command
    BagelCodeActionsProvider.registerFixDiagnosticCommand(context, bagelApiClient);

    // Add all disposables to context
    context.subscriptions.push(...commands, ...providers);

    // Auto-start server if configured
    const config = vscode.workspace.getConfiguration('bagel');
    if (config.get('autoStartServer', true)) {
        try {
            await startServerCommand(serverManager);
            vscode.window.showInformationMessage('🥯 BAGEL AI server started successfully!');
        } catch (error) {
            vscode.window.showWarningMessage(`🥯 Failed to auto-start BAGEL server: ${error}`);
        }
    }

    // Show welcome message
    vscode.window.showInformationMessage(
        '🥯 BAGEL AI is ready! Use Ctrl+Shift+G to generate code, Ctrl+Shift+E to explain code, or Ctrl+Shift+B to open chat.',
        'Open Chat', 'Generate Code'
    ).then(selection => {
        if (selection === 'Open Chat') {
            openChatCommand(chatProvider);
        } else if (selection === 'Generate Code') {
            generateCodeCommand(bagelApiClient);
        }
    });
}

export function deactivate() {
    console.log('🥯 BAGEL AI Extension is now deactivated');
    if (serverManager) {
        serverManager.stopServer();
    }
}