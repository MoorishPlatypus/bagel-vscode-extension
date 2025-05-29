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
exports.openChatCommand = void 0;
const vscode = __importStar(require("vscode"));
async function openChatCommand(chatProvider) {
    try {
        // Focus on the BAGEL chat view
        await vscode.commands.executeCommand('bagelChat.focus');
        // If the chat view is not visible, show it
        await vscode.commands.executeCommand('workbench.view.explorer');
        // Create and show the chat webview
        chatProvider.showChatWebview();
        vscode.window.showInformationMessage('🥯 BAGEL Chat is now open!');
    }
    catch (error) {
        console.error('Open chat command error:', error);
        vscode.window.showErrorMessage(`🥯 Error opening chat: ${error}`);
    }
}
exports.openChatCommand = openChatCommand;
//# sourceMappingURL=openChat.js.map