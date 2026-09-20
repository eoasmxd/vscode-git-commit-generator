import * as vscode from "vscode"
import type { ChatMessage, PluginConfig } from "../types"

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
  }
  message?: string
}

/**
 * 请求兼容 OpenAI 规范的文本补全
 */
export async function requestChatCompletion(
  config: PluginConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const endpoint = normalizeEndpoint(config.apiUrl)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (config.apiKey.trim()) {
    headers["Authorization"] = `Bearer ${config.apiKey.trim()}`
  }

  const payload = {
    model: config.model.trim(),
    messages,
    stream: false,
    temperature: 0.2,
  }

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal,
    })
  } catch (networkError: any) {
    if (signal?.aborted) {
      throw networkError
    }
    throw new Error(
      vscode.l10n.t(
        "Unable to connect to the model service. Possible issues:\n1. Network disconnected or proxy error;\n2. Incorrect API URL;\n3. If using local services (like Ollama), ensure the service is running.",
      ),
    )
  }

  if (!response.ok) {
    let errorDetail = ""
    try {
      const errorPayload = (await response.json()) as ChatCompletionResponse
      errorDetail = errorPayload?.error?.message || errorPayload?.message || ""
    } catch {
      errorDetail = ""
    }
    throw new Error(formatHttpError(response.status, errorDetail))
  }

  let completion: ChatCompletionResponse
  try {
    completion = (await response.json()) as ChatCompletionResponse
  } catch {
    throw new Error(
      vscode.l10n.t("Invalid response format from model service (non-JSON). Please verify your API URL."),
    )
  }

  const commitContent = completion?.choices?.[0]?.message?.content
  if (typeof commitContent !== "string" || !commitContent.trim()) {
    const apiError = completion?.error?.message ? ` (${completion.error.message})` : ""
    throw new Error(
      vscode.l10n.t(
        "No valid commit message returned{0}. Possible issue: model name is incorrect or currently unavailable.",
        apiError,
      ),
    )
  }

  return commitContent.trim()
}

/**
 * 格式化 HTTP 状态码错误
 */
function formatHttpError(statusCode: number, detail: string): string {
  const detailSuffix = detail ? ` [${detail}]` : ""
  if (statusCode === 401) {
    return vscode.l10n.t(
      "Authentication failed (HTTP 401): Invalid or missing API Key. Please check your settings.{0}",
      detailSuffix,
    )
  }
  if (statusCode === 403) {
    return vscode.l10n.t(
      "Access denied (HTTP 403): Please check account permissions, balance, or region restrictions.{0}",
      detailSuffix,
    )
  }
  if (statusCode === 404) {
    return vscode.l10n.t(
      "Endpoint not found (HTTP 404): Please verify the API URL and ensure the endpoint is supported.{0}",
      detailSuffix,
    )
  }
  if (statusCode === 429) {
    return vscode.l10n.t(
      "Rate limit reached (HTTP 429): Too many requests or quota exhausted. Please try again later.{0}",
      detailSuffix,
    )
  }
  if (statusCode >= 500) {
    return vscode.l10n.t(
      "Model service unavailable (HTTP {0}): Provider might be experiencing issues or maintenance. Please try again later.",
      statusCode,
    )
  }
  return vscode.l10n.t(
    "Model service returned HTTP {0}. Please check your model and service settings.{1}",
    statusCode,
    detailSuffix,
  )
}

function normalizeEndpoint(apiUrl: string): string {
  const normalizedUrl = apiUrl.trim().replace(/\/+$/, "")
  if (normalizedUrl.endsWith("/chat/completions")) {
    return normalizedUrl
  }
  return `${normalizedUrl}/chat/completions`
}
