# 🥯 BAGEL AI - VS Code Extension

**Multimodal AI coding assistant powered by BAGEL**

Transform your coding experience with BAGEL's advanced AI capabilities directly in VS Code. Generate code, explain complex logic, optimize performance, create images, and chat with an intelligent AI assistant.

![BAGEL AI Extension](https://img.shields.io/badge/BAGEL-AI%20Assistant-blue?logo=visualstudiocode)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 🧠 **AI-Powered Code Generation**
- Generate code from natural language descriptions
- Context-aware suggestions based on your current file
- Support for 50+ programming languages
- Smart completion with project context

### 📖 **Intelligent Code Explanation**
- Explain complex code segments with AI
- Hover over code for instant explanations
- Understand algorithms and design patterns
- Learn from AI-generated documentation

### ⚡ **Code Optimization**
- Optimize code for performance and readability
- Get suggestions for best practices
- Refactor code with AI assistance
- Side-by-side diff view for changes

### 💬 **Interactive AI Chat**
- Chat with BAGEL AI about your code
- Ask questions about programming concepts
- Get help with debugging and problem-solving
- Context-aware conversations

### 🎨 **Image Generation** *(Full BAGEL Model Required)*
- Generate images from text descriptions
- Create diagrams and visualizations
- Design assets for your projects
- Multimodal AI capabilities

## 🚀 Quick Start

### Installation

1. **Install the Extension**
   ```bash
   # From VS Code Marketplace (coming soon)
   code --install-extension bagel-ai.bagel-ai
   
   # Or install from VSIX
   code --install-extension bagel-ai-1.0.0.vsix
   ```

2. **Start Using BAGEL**
   - The extension will auto-start a basic BAGEL server
   - Use `Ctrl+Shift+G` to generate code
   - Use `Ctrl+Shift+E` to explain selected code
   - Use `Ctrl+Shift+B` to open AI chat

### First Steps

1. **Generate Your First Code**
   - Press `Ctrl+Shift+P` and type "BAGEL: Generate Code"
   - Describe what you want: "Create a function that sorts an array"
   - Watch BAGEL generate the code for you!

2. **Explain Existing Code**
   - Select any code in your editor
   - Right-click and choose "Explain with BAGEL"
   - Get instant AI explanations

3. **Chat with AI**
   - Press `Ctrl+Shift+B` to open BAGEL Chat
   - Ask questions about your code or programming concepts
   - Get intelligent, context-aware responses

## 🎯 Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `BAGEL: Generate Code` | `Ctrl+Shift+G` | Generate code from description |
| `BAGEL: Explain Code` | `Ctrl+Shift+E` | Explain selected code |
| `BAGEL: Optimize Code` | - | Optimize selected code |
| `BAGEL: Open Chat` | `Ctrl+Shift+B` | Open AI chat interface |
| `BAGEL: Generate Image` | - | Generate images (requires full BAGEL) |
| `BAGEL: Start Server` | - | Start BAGEL server |
| `BAGEL: Stop Server` | - | Stop BAGEL server |

## ⚙️ Configuration

Configure BAGEL AI in VS Code settings:

```json
{
  "bagel.serverUrl": "http://localhost:12000",
  "bagel.autoStartServer": true,
  "bagel.maxTokens": 2048,
  "bagel.temperature": 0.7
}
```

### Settings

- **`bagel.serverUrl`**: BAGEL server URL (default: `http://localhost:12000`)
- **`bagel.autoStartServer`**: Auto-start server when extension activates (default: `true`)
- **`bagel.maxTokens`**: Maximum tokens for code generation (default: `2048`)
- **`bagel.temperature`**: AI creativity level 0-2 (default: `0.7`)

## 🔧 Advanced Setup

### Using Full BAGEL Model

For complete AI capabilities including image generation and advanced multimodal features:

1. **Install BAGEL**
   ```bash
   git clone https://github.com/bytedance-seed/BAGEL.git
   cd BAGEL
   conda create -n bagel python=3.10 -y
   conda activate bagel
   pip install -r requirements.txt
   ```

2. **Download BAGEL Model**
   ```python
   from huggingface_hub import snapshot_download
   
   save_dir = "/path/to/save/BAGEL-7B-MoT"
   repo_id = "ByteDance-Seed/BAGEL-7B-MoT"
   
   snapshot_download(
       repo_id=repo_id,
       local_dir=save_dir,
       local_dir_use_symlinks=False
   )
   ```

3. **Configure Extension**
   - Update `bagel.serverUrl` to point to your BAGEL server
   - Restart VS Code
   - Enjoy full AI capabilities!

## 🎨 Features in Action

### Code Generation
```typescript
// Type: "Create a TypeScript function that validates email addresses"
// BAGEL generates:

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
```

### Code Explanation
```python
# Select this code and use "Explain with BAGEL"
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# BAGEL explains:
# "This is a recursive implementation of the Fibonacci sequence..."
```

### AI Chat
```
You: "How can I optimize this sorting algorithm?"
BAGEL: "I can see you're using bubble sort. Here are several optimizations..."
```

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/MoorishPlatypus/bagel-vscode-extension.git
cd bagel-vscode-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package extension
npm run package
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📊 System Requirements

- **VS Code**: Version 1.74.0 or higher
- **Node.js**: Version 16.x or higher
- **Python**: Version 3.8+ (for BAGEL server)
- **Memory**: 4GB RAM minimum, 8GB recommended
- **GPU**: Optional but recommended for full BAGEL model

## 🔍 Troubleshooting

### Common Issues

**Server Not Starting**
- Check Python installation: `python --version`
- Verify port 12000 is available
- Check the Output panel for error messages

**No AI Responses**
- Ensure BAGEL server is running
- Check network connectivity
- Verify server URL in settings

**Performance Issues**
- Reduce `maxTokens` in settings
- Close unnecessary applications
- Consider using a GPU for full BAGEL model

### Getting Help

- 📖 [Documentation](https://github.com/MoorishPlatypus/bagel-vscode-extension/wiki)
- 🐛 [Report Issues](https://github.com/MoorishPlatypus/bagel-vscode-extension/issues)
- 💬 [Discussions](https://github.com/MoorishPlatypus/bagel-vscode-extension/discussions)
- 🥯 [BAGEL Discord](https://discord.gg/Z836xxzy)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **BAGEL Team** at ByteDance for the amazing AI model
- **VS Code Team** for the excellent extension API
- **Open Source Community** for inspiration and contributions

## 🔗 Links

- 🥯 [BAGEL Repository](https://github.com/bytedance-seed/BAGEL)
- 🌐 [BAGEL Website](https://bagel-ai.org/)
- 📄 [BAGEL Paper](https://arxiv.org/abs/2505.14683)
- 🤗 [BAGEL Model](https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT)
- 🎮 [BAGEL Demo](https://demo.bagel-ai.org/)

  ## 🙏  Donations
If you'd like to support development:

Bitcoin: 17ospCx6MbNQfqETd1UjAQQSus8ENHXgnh


---

**Made by Sxedra and The Moorish with ❤️ by the community for developers worldwide**

*Transform your coding experience with BAGEL AI - where artificial intelligence meets human creativity.*
