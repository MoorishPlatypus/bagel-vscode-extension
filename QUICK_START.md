# BAGEL AI VS Code Extension - Quick Start Guide

## 🚀 Installation (2 minutes)

### Option 1: Install from VSIX (Recommended)
```bash
# Install the packaged extension
code --install-extension bagel-ai-1.0.0.vsix

# Restart VS Code
```

### Option 2: Development Mode
```bash
# Open the extension folder in VS Code
code /workspace/bagel-vscode-extension

# Press F5 to launch Extension Development Host
# Test in the new VS Code window that opens
```

## 🎯 Quick Test (1 minute)

1. **Open Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)

2. **Try These Commands**:
   - `BAGEL: Generate Code` - Generate code from description
   - `BAGEL: Open Chat` - Open AI chat sidebar
   - `BAGEL: Explain Code` - Select code and explain it

3. **Test Hover Feature**:
   - Hover over any function or variable
   - See AI-powered explanations appear

## 🔧 Features Overview

| Feature | Command | Description |
|---------|---------|-------------|
| 🤖 Code Generation | `BAGEL: Generate Code` | Generate code from natural language |
| 💡 Code Explanation | `BAGEL: Explain Code` | Explain selected code |
| ⚡ Code Optimization | `BAGEL: Optimize Code` | Improve code performance |
| 🎨 Image Generation | `BAGEL: Generate Image` | Create images from text |
| 💬 AI Chat | `BAGEL: Open Chat` | Interactive AI assistant |
| 🔧 Server Control | `BAGEL: Start/Stop Server` | Manage BAGEL server |

## 🛠️ Configuration

The extension works out-of-the-box with an embedded fallback server. For full functionality:

1. **Set up BAGEL Server** (optional):
   ```bash
   # Clone BAGEL repository
   git clone https://github.com/bytedance-seed/BAGEL.git
   
   # Follow BAGEL setup instructions
   # Start server on localhost:8000
   ```

2. **Configure Extension** (if needed):
   - Open VS Code Settings
   - Search for "BAGEL"
   - Adjust server URL and other preferences

## 🎉 You're Ready!

The extension is now installed and ready to use. Start coding with AI assistance!

### Need Help?
- Check the README.md for detailed documentation
- Use the chat feature to ask the AI directly
- Report issues on the project repository

**Happy Coding with BAGEL AI! 🥯🤖**