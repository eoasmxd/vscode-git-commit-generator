# Git Commit Generator for VS Code

[English](README.md) | [中文](README.zh-CN.md)

A lightweight and focused VS Code extension that generates and polishes Git commit messages using Large Language Models (LLM). Highly customizable prompts to summarize changes your way, smart draft blending, and seamless compatibility with OpenAI-compatible APIs (OpenAI, DeepSeek, Ollama, and more).

---

## ✨ Features

- **Focused & Lightweight**: Dedicated to doing one thing well — generating clear, conventional, high-quality Git commit messages.
- **Native SCM Integration**: One-click action buttons embedded in VS Code's Source Control panel title bar for effortless triggering.
- **Fully Customizable Prompts**: Easily customize system prompts and request templates with `{diff}` and `{user_input}` placeholders to suit your team's style (Conventional Commits, Gitmoji, concise summaries, etc.).
- **Smart Prompt Blending**: If notes or requirements already exist in your commit box (e.g. "focus on fixing timeout bug"), the model prioritizes them during generation.
- **Clean & Reliable Architecture**: Commit messages are concise by nature; avoids unnecessary streaming overhead. Uses standard native `fetch` without bulky dependencies, fully compatible with OpenAI-compatible endpoints.
- **Smart Diff Extraction**: Automatically prioritizes staged changes; falls back to unstaged workspace diffs and untracked files with built-in truncation guards.

---

## Installation & Build

### 1. Build & Package Commands

Run the following commands in the project root directory:

* **Package VSIX** (without global `vsce` installation):
  ```bash
  npm install
  npm run package
  ```
  *(This compiles the extension and generates `vscode-git-commit-generator-${version}.vsix` in the root directory)*

* **Clean Build Output**:
  ```bash
  npm run clean
  ```
  *(Removes the `dist/` output directory and all `.vsix` packages)*

* **Compile Locally**:
  ```bash
  npm run compile
  ```

### 2. Manual Installation

After packaging the `.vsix` file, you can install it directly via the VS Code interface:
1. Open the VS Code Command Palette (`Ctrl+Shift+P`).
2. Search and select `Extensions: Install from VSIX...`.
3. Choose the generated `vscode-git-commit-generator-${version}.vsix` file to complete the installation.
4. Reload the VS Code Window (`Developer: Reload Window`) to apply changes.

---

## ⚙️ Extension Settings

Configure in VS Code Settings (`Ctrl+,` or `Cmd+,`) by searching for `gitCommitGen`:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `gitCommitGen.apiUrl` | `string` | `""` | Model service API base URL (Required, supports compatible endpoints) |
| `gitCommitGen.apiKey` | `string` | `""` | API key for authentication (optional for local services like Ollama) |
| `gitCommitGen.model` | `string` | `""` | Model identifier (Required) |
| `gitCommitGen.systemPrompt` | `string` | *(Built-in)* | System prompt specifying role and output format (Conventional Commits) |
| `gitCommitGen.promptTemplate` | `string` | *(Built-in)* | User request template supporting `{diff}` and `{user_input}` variables |

### Common Service Configurations

#### 1. DeepSeek (Recommended, Cost-effective)
```json
{
  "gitCommitGen.apiUrl": "https://api.deepseek.com/v1",
  "gitCommitGen.apiKey": "sk-your-deepseek-key",
  "gitCommitGen.model": "deepseek-v4-flash"
}
```

#### 2. Alibaba DashScope / Qwen
```json
{
  "gitCommitGen.apiUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "gitCommitGen.apiKey": "sk-your-dashscope-key",
  "gitCommitGen.model": "qwen-turbo"
}
```

#### 3. Local Ollama (Self-hosted)
```json
{
  "gitCommitGen.apiUrl": "http://localhost:11434/v1",
  "gitCommitGen.apiKey": "",
  "gitCommitGen.model": "qwen2.5-coder:7b"
}
```

#### 4. Official OpenAI
```json
{
  "gitCommitGen.apiUrl": "https://api.openai.com/v1",
  "gitCommitGen.apiKey": "sk-your-openai-key",
  "gitCommitGen.model": "gpt-4o-mini"
}
```

---

## 💡 Usage

1. **Generate**:
   Open the **Source Control** panel in VS Code. Click the sparkle icon `✨` in the title bar (or run `Git Commit Generator: Generate Commit Message` from the Command Palette).
   > *Tip: No default shortcut is pre-configured to avoid collisions. You can bind one yourself in `Preferences -> Keyboard Shortcuts` by searching for `gitCommitGen.generate`.*
2. **Refine / Custom Instruction**:
   Type brief instructions or bullet points into the commit box, then click generate. The model will adapt its output accordingly.
3. **Abort**:
   While generating, the button changes to a stop icon `⏹`. Click anytime to cancel the in-flight request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
