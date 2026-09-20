import type { Uri } from "vscode"

export interface PluginConfig {
  apiUrl: string
  apiKey: string
  model: string
  systemPrompt: string
  promptTemplate: string
}

export interface GitInputBox {
  value: string
}

export interface GitRepository {
  rootUri: Uri
  inputBox: GitInputBox
}

export interface GitApi {
  repositories: GitRepository[]
  getRepository(uri: Uri): GitRepository | null | undefined
}

export interface GitExtensionExports {
  getAPI(version: 1): GitApi
}

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}
