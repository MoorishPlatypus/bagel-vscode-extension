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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const bagelClient_1 = require("./api/bagelClient");
const chatProvider_1 = require("./providers/chatProvider");
const hoverProvider_1 = require("./providers/hoverProvider");
const codeActionsProvider_1 = require("./providers/codeActionsProvider");
const generateCode_1 = require("./commands/generateCode");
const explainCode_1 = require("./commands/explainCode");
const optimizeCode_1 = require("./commands/optimizeCode");
const openChat_1 = require("./commands/openChat");
const generateImage_1 = require("./commands/generateImage");
const serverCommands_1 = require("./commands/serverCommands");
const serverManager_1 = require("./utils/serverManager");
let bagelApiClient;
let serverManager;
let chatProvider;
async function activate(context) {
    console.log('🥯 BAGEL AI Extension is now active!');
    // Initialize components
    bagelApiClient = new bagelClient_1.BagelApiClient();
    serverManager = new serverManager_1.BagelServerManager();
    chatProvider = new chatProvider_1.BagelChatProvider(context, bagelApiClient);
    // Set context for when BAGEL is enabled
    vscode.commands.executeCommand('setContext', 'bagel.enabled', true);
    // Register commands
    const commands = [
        vscode.commands.registerCommand('bagel.generateCode', () => (0, generateCode_1.generateCodeCommand)(bagelApiClient)),
        vscode.commands.registerCommand('bagel.explainCode', () => (0, explainCode_1.explainCodeCommand)(bagelApiClient)),
        vscode.commands.registerCommand('bagel.optimizeCode', () => (0, optimizeCode_1.optimizeCodeCommand)(bagelApiClient)),
        vscode.commands.registerCommand('bagel.openChat', () => (0, openChat_1.openChatCommand)(chatProvider)),
        vscode.commands.registerCommand('bagel.generateImage', () => (0, generateImage_1.generateImageCommand)(bagelApiClient)),
        vscode.commands.registerCommand('bagel.startServer', () => (0, serverCommands_1.startServerCommand)(serverManager)),
        vscode.commands.registerCommand('bagel.stopServer', () => (0, serverCommands_1.stopServerCommand)(serverManager))
    ];
    // Register providers
    const providers = [
        vscode.languages.registerHoverProvider('*', new hoverProvider_1.BagelHoverProvider(bagelApiClient)),
        vscode.languages.registerCodeActionsProvider('*', new codeActionsProvider_1.BagelCodeActionsProvider(), {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.Refactor]
        }),
        vscode.window.registerTreeDataProvider('bagelChat', chatProvider)
    ];
    // Register the fix diagnostic command
    codeActionsProvider_1.BagelCodeActionsProvider.registerFixDiagnosticCommand(context, bagelApiClient);
    // Add all disposables to context
    context.subscriptions.push(...commands, ...providers);
    // Auto-start server if configured
    const config = vscode.workspace.getConfiguration('bagel');
    if (config.get('autoStartServer', true)) {
        try {
            await (0, serverCommands_1.startServerCommand)(serverManager);
            vscode.window.showInformationMessage('🥯 BAGEL AI server started successfully!');
        }
        catch (error) {
            vscode.window.showWarningMessage(`🥯 Failed to auto-start BAGEL server: ${error}`);
        }
    }
    // Show welcome message
    vscode.window.showInformationMessage('🥯 BAGEL AI is ready! Use Ctrl+Shift+G to generate code, Ctrl+Shift+E to explain code, or Ctrl+Shift+B to open chat.', 'Open Chat', 'Generate Code').then(selection => {
        if (selection === 'Open Chat') {
            (0, openChat_1.openChatCommand)(chatProvider);
        }
        else if (selection === 'Generate Code') {
            (0, generateCode_1.generateCodeCommand)(bagelApiClient);
        }
    });
}
exports.activate = activate;
function deactivate() {
    console.log('🥯 BAGEL AI Extension is now deactivated');
    if (serverManager) {
        serverManager.stopServer();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map