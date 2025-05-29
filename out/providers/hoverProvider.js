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
exports.BagelHoverProvider = void 0;
const vscode = __importStar(require("vscode"));
class BagelHoverProvider {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    async provideHover(document, position, token) {
        try {
            // Check if BAGEL server is running
            const isHealthy = await this.apiClient.checkHealth();
            if (!isHealthy) {
                return undefined;
            }
            // Get the word or expression at the current position
            const wordRange = document.getWordRangeAtPosition(position);
            if (!wordRange) {
                return undefined;
            }
            // Expand range to include more context (e.g., function calls, method chains)
            const line = document.lineAt(position.line);
            const lineText = line.text;
            // Find a meaningful code segment around the position
            let startChar = wordRange.start.character;
            let endChar = wordRange.end.character;
            // Expand backwards to include object/method chains
            while (startChar > 0 && /[a-zA-Z0-9_\.]/.test(lineText[startChar - 1])) {
                startChar--;
            }
            // Expand forwards to include method calls and parameters
            while (endChar < lineText.length && /[a-zA-Z0-9_\.\(\)]/.test(lineText[endChar])) {
                endChar++;
            }
            const expandedRange = new vscode.Range(position.line, startChar, position.line, endChar);
            const codeSegment = document.getText(expandedRange).trim();
            if (!codeSegment || codeSegment.length < 2) {
                return undefined;
            }
            // Don't provide hover for very common keywords
            const commonKeywords = ['if', 'else', 'for', 'while', 'return', 'var', 'let', 'const', 'function'];
            if (commonKeywords.includes(codeSegment.toLowerCase())) {
                return undefined;
            }
            // Get surrounding context for better explanation
            const contextRange = new vscode.Range(Math.max(0, position.line - 3), 0, Math.min(document.lineCount - 1, position.line + 3), document.lineAt(Math.min(document.lineCount - 1, position.line + 3)).text.length);
            const context = document.getText(contextRange);
            // Request explanation from BAGEL
            const response = await this.apiClient.explainCode({
                code: codeSegment,
                language: document.languageId,
                context: context
            });
            if (response.success && response.data) {
                const explanation = response.data.explanation || response.data.text || response.data;
                // Create hover content
                const hoverContent = new vscode.MarkdownString();
                hoverContent.isTrusted = true;
                hoverContent.supportHtml = true;
                hoverContent.appendMarkdown(`**🥯 BAGEL AI Explanation**\n\n`);
                hoverContent.appendCodeblock(codeSegment, document.languageId);
                hoverContent.appendMarkdown(`\n${explanation}\n\n`);
                hoverContent.appendMarkdown(`*Powered by BAGEL AI*`);
                return new vscode.Hover(hoverContent, expandedRange);
            }
        }
        catch (error) {
            console.error('Hover provider error:', error);
            // Silently fail for hover providers to avoid annoying users
        }
        return undefined;
    }
}
exports.BagelHoverProvider = BagelHoverProvider;
//# sourceMappingURL=hoverProvider.js.map