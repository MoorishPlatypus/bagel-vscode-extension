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
exports.stopServerCommand = exports.startServerCommand = void 0;
const vscode = __importStar(require("vscode"));
async function startServerCommand(serverManager) {
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
            }
            else {
                vscode.window.showErrorMessage('🥯 Failed to start BAGEL server. Check the output panel for details.');
            }
        });
    }
    catch (error) {
        console.error('Start server command error:', error);
        vscode.window.showErrorMessage(`🥯 Error starting server: ${error}`);
    }
}
exports.startServerCommand = startServerCommand;
async function stopServerCommand(serverManager) {
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
            }
            else {
                vscode.window.showWarningMessage('🥯 Server may not have been running or failed to stop properly.');
            }
        });
    }
    catch (error) {
        console.error('Stop server command error:', error);
        vscode.window.showErrorMessage(`🥯 Error stopping server: ${error}`);
    }
}
exports.stopServerCommand = stopServerCommand;
//# sourceMappingURL=serverCommands.js.map