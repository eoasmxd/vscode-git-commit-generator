# vscode-git-commit-generator

[English](README.md) | [中文](README.zh-CN.md)

一款专注于单一功能、轻量纯粹的 VS Code 智能 Git Commit 信息生成扩展。支持高度自定义提示词与提炼模板、按个人偏好精准总结代码变更、自动融合已有草稿，完美兼容 OpenAI、DeepSeek、Ollama 等所有标准 OpenAI 接口。

---

## ✨ 核心特性

- **单一专注**：只做一件事——快速生成高质量、标准化的 Git Commit 提交信息。
- **Git 界面无缝集成**：在 VS Code 源代码管理（Source Control）面板右上角提供生成与停止按钮，支持一键触发。
- **高度定制提示词**：支持自由配置系统设定（System Prompt）与提炼模板，内置 `{diff}` 和 `{user_input}` 占位符，可自由定制为 Conventional Commits、Gitmoji、中文极简风等任意风格。
- **智能融合现有输入**：若提交框中已有内容（例如写下的要点或“重点说明修复了登录超时”等提示），插件会将其作为最高优先级指令引导模型润色生成。
- **极简稳定，拒绝过度复杂**：Commit 信息短小精炼，无需流式拼装开销。基于原生 `fetch` 发起标准请求，零第三方重型依赖，广泛兼容 OpenAI、DeepSeek、通义千问、Ollama、OneAPI 等端点。
- **智能差异提取**：优先提取已暂存（Staged）改动；未暂存时自动汇总工作区变更并包含未跟踪文件，内置超长差异保护截断。

---

## 安装与构建

### 1. 快捷开发与打包命令

在项目根目录下运行以下命令进行构建和打包：

* **一键打包**（免全局安装 `vsce`）：
  ```bash
  npm install
  npm run package
  ```
  *(该指令会自动构建，并在根目录下生成 `vscode-git-commit-generator-${version}.vsix` 插件包)*

* **一键清理构建垃圾**：
  ```bash
  npm run clean
  ```
  *(会物理删除 `dist/` 输出目录和所有的 `.vsix` 文件包)*

* **本地一键编译**：
  ```bash
  npm run compile
  ```

### 2. 手动安装插件

打包生成 `.vsix` 文件后，你可以直接通过 VS Code 界面进行安装：
1. 打开 VS Code 的命令面板（`Ctrl+Shift+P`）。
2. 输入并选择 `Extensions: Install from VSIX...`（从 VSIX 安装...）。
3. 选中项目根目录下打包出来的 `vscode-git-commit-generator-${version}.vsix` 文件，即可完成安装。
4. 安装后，重新加载 VS Code 窗口（Reload Window）即可生效。

---

## ⚙️ 配置说明

在 VS Code `设置`（`Ctrl+,` 或 `Cmd+,`）中搜索 `gitCommitGen`，或在 `settings.json` 中配置：

| 配置项 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `gitCommitGen.apiUrl` | `string` | `""` | API 基础地址（必填，支持各类兼容端点） |
| `gitCommitGen.apiKey` | `string` | `""` | 模型服务访问密钥（本地服务如 Ollama 可留空） |
| `gitCommitGen.model` | `string` | `""` | 请求的模型标识符（必填） |
| `gitCommitGen.systemPrompt` | `string` | *(内置预设)* | 设定模型的角色和输出规范（默认 Conventional Commits 格式） |
| `gitCommitGen.promptTemplate` | `string` | *(内置模板)* | 用户请求模板，支持 `{diff}` 和 `{user_input}` 占位符 |

### 常见服务配置示例

#### 1. DeepSeek（推荐，高性价比）
```json
{
  "gitCommitGen.apiUrl": "https://api.deepseek.com/v1",
  "gitCommitGen.apiKey": "sk-your-deepseek-key",
  "gitCommitGen.model": "deepseek-v4-flash"
}
```

#### 2. 阿里云百炼 / 通义千问
```json
{
  "gitCommitGen.apiUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "gitCommitGen.apiKey": "sk-your-dashscope-key",
  "gitCommitGen.model": "qwen-turbo"
}
```

#### 3. 本地 Ollama（私有化部署）
```json
{
  "gitCommitGen.apiUrl": "http://localhost:11434/v1",
  "gitCommitGen.apiKey": "",
  "gitCommitGen.model": "qwen2.5-coder:7b"
}
```

#### 4. OpenAI 官方
```json
{
  "gitCommitGen.apiUrl": "https://api.openai.com/v1",
  "gitCommitGen.apiKey": "sk-your-openai-key",
  "gitCommitGen.model": "gpt-4o-mini"
}
```

---

## 💡 使用方式

1. **直接生成**：
   在 VS Code 侧边栏打开「源代码管理」面板，点击面板标题栏右上角闪烁图标 `✨`（或在命令面板中执行 `Git Commit Generator: 生成 Commit 信息`）。
   > *提示：插件默认未预设快捷键以避免按键冲突，您可在 VS Code `首选项 -> 键盘快捷方式` 中搜索 `gitCommitGen.generate` 自由绑定喜欢的快捷键（如 `Ctrl+Alt+G` / `Cmd+Alt+G`）。*

2. **按既有要求润色/定向生成**：
   在 Commit 输入框中输入简短要求（如 `英文书写，强调性能优化`），点击生成按钮，大模型将以该要求为最高优先级调整输出。

3. **停止生成**：
   生成过程中，右上角按钮自动切换为停止图标 `⏹`，点击可随时中止当前生成请求。

---

## 📄 开源许可证

本项目采用 [MIT License](LICENSE) 许可。
