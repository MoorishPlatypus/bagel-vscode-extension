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
exports.BagelChatProvider = void 0;
const vscode = __importStar(require("vscode"));
class BagelChatProvider {
    constructor(context, apiClient) {
        this.context = context;
        this.apiClient = apiClient;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.chatHistory = [];
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // Root level - show recent conversations
            const items = [
                new ChatItem('New Chat', vscode.TreeItemCollapsibleState.None, 'new-chat'),
                new ChatItem('Recent Conversations', vscode.TreeItemCollapsibleState.Expanded, 'recent')
            ];
            return Promise.resolve(items);
        }
        else if (element.contextValue === 'recent') {
            // Show recent chat messages
            const recentItems = this.chatHistory.slice(-5).map((msg, index) => new ChatItem(`${msg.role}: ${msg.content.substring(0, 50)}...`, vscode.TreeItemCollapsibleState.None, 'message'));
            return Promise.resolve(recentItems);
        }
        return Promise.resolve([]);
    }
    showChatWebview() {
        if (this.webviewPanel) {
            this.webviewPanel.reveal();
            return;
        }
        this.webviewPanel = vscode.window.createWebviewPanel('bagelChat', '🥯 BAGEL AI Chat', vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        this.webviewPanel.webview.html = this.getChatWebviewContent();
        // Handle messages from webview
        this.webviewPanel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'sendMessage':
                    await this.handleChatMessage(message.text);
                    break;
                case 'clearChat':
                    this.chatHistory = [];
                    this.refresh();
                    this.updateWebviewChat();
                    break;
            }
        }, undefined, this.context.subscriptions);
        this.webviewPanel.onDidDispose(() => {
            this.webviewPanel = undefined;
        });
    }
    async handleChatMessage(userMessage) {
        if (!userMessage.trim()) {
            return;
        }
        // Add user message to history
        this.chatHistory.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });
        // Update webview to show user message
        this.updateWebviewChat();
        try {
            // Get current editor context
            const editor = vscode.window.activeTextEditor;
            let context = '';
            if (editor) {
                const selection = editor.selection;
                if (!selection.isEmpty) {
                    context = `Current selection:\n\`\`\`${editor.document.languageId}\n${editor.document.getText(selection)}\n\`\`\`\n\n`;
                }
                context += `Current file: ${editor.document.fileName}\nLanguage: ${editor.document.languageId}`;
            }
            // Send to BAGEL API
            const response = await this.apiClient.chat({
                message: userMessage,
                context: context,
                conversationId: 'vscode-chat'
            });
            if (response.success && response.data) {
                const aiResponse = response.data.response || response.data.text || response.data;
                // Add AI response to history
                this.chatHistory.push({
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date()
                });
            }
            else {
                // Add error message
                this.chatHistory.push({
                    role: 'assistant',
                    content: `Sorry, I encountered an error: ${response.error}`,
                    timestamp: new Date()
                });
            }
        }
        catch (error) {
            this.chatHistory.push({
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error}`,
                timestamp: new Date()
            });
        }
        // Update UI
        this.refresh();
        this.updateWebviewChat();
    }
    updateWebviewChat() {
        if (this.webviewPanel) {
            this.webviewPanel.webview.postMessage({
                command: 'updateChat',
                messages: this.chatHistory
            });
        }
    }
    getChatWebviewContent() {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>BAGEL AI Chat</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    margin: 0;
                    padding: 20px;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                
                .chat-container {
                    flex: 1;
                    overflow-y: auto;
                    margin-bottom: 20px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    padding: 10px;
                }
                
                .message {
                    margin-bottom: 15px;
                    padding: 10px;
                    border-radius: 8px;
                }
                
                .user-message {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    margin-left: 20%;
                }
                
                .assistant-message {
                    background-color: var(--vscode-input-background);
                    border: 1px solid var(--vscode-input-border);
                    margin-right: 20%;
                }
                
                .message-header {
                    font-weight: bold;
                    margin-bottom: 5px;
                    font-size: 0.9em;
                }
                
                .message-content {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                
                .input-container {
                    display: flex;
                    gap: 10px;
                }
                
                .message-input {
                    flex: 1;
                    padding: 10px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    font-family: inherit;
                }
                
                .send-button, .clear-button {
                    padding: 10px 20px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: inherit;
                }
                
                .send-button:hover, .clear-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 1.2em;
                    font-weight: bold;
                }
                
                .empty-state {
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    margin-top: 50px;
                }
            </style>
        </head>
        <body>
            <div class="header">🥯 BAGEL AI Assistant</div>
            
            <div class="chat-container" id="chatContainer">
                <div class="empty-state">
                    Start a conversation with BAGEL AI!<br>
                    Ask questions about your code, request explanations, or get help with programming.
                </div>
            </div>
            
            <div class="input-container">
                <input type="text" id="messageInput" class="message-input" placeholder="Type your message here..." />
                <button id="sendButton" class="send-button">Send</button>
                <button id="clearButton" class="clear-button">Clear</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                const chatContainer = document.getElementById('chatContainer');
                const messageInput = document.getElementById('messageInput');
                const sendButton = document.getElementById('sendButton');
                const clearButton = document.getElementById('clearButton');

                function sendMessage() {
                    const message = messageInput.value.trim();
                    if (message) {
                        vscode.postMessage({
                            command: 'sendMessage',
                            text: message
                        });
                        messageInput.value = '';
                    }
                }

                function clearChat() {
                    vscode.postMessage({
                        command: 'clearChat'
                    });
                }

                function updateChat(messages) {
                    if (messages.length === 0) {
                        chatContainer.innerHTML = '<div class="empty-state">Start a conversation with BAGEL AI!<br>Ask questions about your code, request explanations, or get help with programming.</div>';
                        return;
                    }

                    chatContainer.innerHTML = '';
                    messages.forEach(msg => {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = \`message \${msg.role === 'user' ? 'user-message' : 'assistant-message'}\`;
                        
                        const headerDiv = document.createElement('div');
                        headerDiv.className = 'message-header';
                        headerDiv.textContent = msg.role === 'user' ? '👤 You' : '🥯 BAGEL';
                        
                        const contentDiv = document.createElement('div');
                        contentDiv.className = 'message-content';
                        contentDiv.textContent = msg.content;
                        
                        messageDiv.appendChild(headerDiv);
                        messageDiv.appendChild(contentDiv);
                        chatContainer.appendChild(messageDiv);
                    });
                    
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }

                sendButton.addEventListener('click', sendMessage);
                clearButton.addEventListener('click', clearChat);
                
                messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });

                // Listen for messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'updateChat':
                            updateChat(message.messages);
                            break;
                    }
                });
            </script>
        </body>
        </html>
        `;
    }
}
exports.BagelChatProvider = BagelChatProvider;
class ChatItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
        this.tooltip = this.label;
    }
}
//# sourceMappingURL=chatProvider.js.map