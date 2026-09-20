/**
 * 扩展命令与上下文标识常量
 */
export const COMMANDS = {
  GENERATE: "gitCommitGen.generate",
  ABORT: "gitCommitGen.abort",
} as const

export const CONTEXT_KEYS = {
  IS_GENERATING: "gitCommitGen.isGenerating",
} as const

export const CONFIG_SECTION = "gitCommitGen"

export const CONFIG_KEYS = {
  API_URL: "apiUrl",
  API_KEY: "apiKey",
  MODEL: "model",
  SYSTEM_PROMPT: "systemPrompt",
  PROMPT_TEMPLATE: "promptTemplate",
} as const

/**
 * 全局限制与默认配置常量
 */
export const DEFAULT_CONFIG = {
  DIFF_MAX_LENGTH: 30000,
} as const
