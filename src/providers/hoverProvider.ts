import * as vscode from 'vscode';
import { BagelApiClient } from '../api/bagelClient';

export class BagelHoverProvider implements vscode.HoverProvider {
    constructor(private apiClient: BagelApiClient) {}

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
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
            const contextRange = new vscode.Range(
                Math.max(0, position.line - 3),
                0,
                Math.min(document.lineCount - 1, position.line + 3),
                document.lineAt(Math.min(document.lineCount - 1, position.line + 3)).text.length
            );
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
        } catch (error) {
            console.error('Hover provider error:', error);
            // Silently fail for hover providers to avoid annoying users
        }

        return undefined;
    }
}