import * as vscode from "vscode"
import { COMMANDS, CONFIG_KEYS, CONFIG_SECTION, CONTEXT_KEYS } from "./constants"
import { getGitDiff } from "./git/diffService"
import { GitManager } from "./git/gitManager"
import { requestChatCompletion } from "./llm/openaiClient"
import { buildChatMessages } from "./llm/promptBuilder"
import type { PluginConfig } from "./types"
import { cleanCommitMessage } from "./utils/cleaner"
import { Logger } from "./utils/logger"

let currentAbortController: AbortController | undefined

/**
 * 插件激活入口
 */
export function activate(context: vscode.ExtensionContext): void {
  Logger.initialize()
  Logger.info(vscode.l10n.t("Git Commit Generator extension activated"))

  const generateCommand = vscode.commands.registerCommand(
    COMMANDS.GENERATE,
    async (sourceControl?: vscode.SourceControl) => {
      await handleGenerateCommit(sourceControl)
    },
  )

  const abortCommand = vscode.commands.registerCommand(COMMANDS.ABORT, () => {
    handleAbortCommit()
  })

  context.subscriptions.push(generateCommand, abortCommand, {
    dispose: () => {
      handleAbortCommit()
      Logger.dispose()
    },
  })
}

/**
 * 插件停用释放资源
 */
export function deactivate(): void {
  handleAbortCommit()
  Logger.dispose()
}

/**
 * 执行 Commit 信息生成
 */
async function handleGenerateCommit(sourceControl?: vscode.SourceControl): Promise<void> {
  if (currentAbortController) {
    return
  }

  try {
    const repository = await GitManager.resolveRepository(sourceControl)
    const repoPath = repository.rootUri.fsPath
    const existingInput = repository.inputBox.value || ""

    const gitDiff = await getGitDiff(repoPath)
    if (!gitDiff && !existingInput.trim()) {
      vscode.window.showInformationMessage(vscode.l10n.t("No code changes detected in the current repository."))
      return
    }

    const config = getPluginConfig()
    if (!config.apiUrl || !config.model) {
      const action = await vscode.window.showErrorMessage(
        vscode.l10n.t("Missing model configuration (API URL or model name). Please configure the model service first."),
        vscode.l10n.t("Open Settings"),
      )
      if (action === vscode.l10n.t("Open Settings")) {
        await vscode.commands.executeCommand("workbench.action.openSettings", CONFIG_SECTION)
      }
      return
    }

    const messages = buildChatMessages(config, gitDiff, existingInput)

    currentAbortController = new AbortController()
    await setGeneratingState(true)

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.SourceControl,
        title: vscode.l10n.t("Generating commit message..."),
        cancellable: true,
      },
      async (_progress, token) => {
        token.onCancellationRequested(() => {
          handleAbortCommit()
        })

        const rawMessage = await requestChatCompletion(
          config,
          messages,
          currentAbortController?.signal,
        )
        repository.inputBox.value = cleanCommitMessage(rawMessage)
      },
    )
  } catch (error: unknown) {
    if (currentAbortController?.signal.aborted) {
      Logger.info(vscode.l10n.t("Commit generation was aborted by user."))
      return
    }

    const errorMsg = error instanceof Error ? error.message : String(error)
    Logger.error(vscode.l10n.t("Failed to generate commit message"), error)

    const action = await vscode.window.showErrorMessage(
      vscode.l10n.t("Failed to generate commit: {0}", errorMsg),
      vscode.l10n.t("Open Settings"),
      vscode.l10n.t("View Logs"),
    )
    if (action === vscode.l10n.t("Open Settings")) {
      await vscode.commands.executeCommand("workbench.action.openSettings", CONFIG_SECTION)
    } else if (action === vscode.l10n.t("View Logs")) {
      Logger.show()
    }
  } finally {
    currentAbortController = undefined
    await setGeneratingState(false)
  }
}

/**
 * 中止当前生成请求
 */
function handleAbortCommit(): void {
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = undefined
  }
  setGeneratingState(false)
}

/**
 * 更新生成中上下文状态
 */
async function setGeneratingState(isGenerating: boolean): Promise<void> {
  await vscode.commands.executeCommand("setContext", CONTEXT_KEYS.IS_GENERATING, isGenerating)
}

/**
 * 读取插件配置项
 */
function getPluginConfig(): PluginConfig {
  const workspaceConfig = vscode.workspace.getConfiguration(CONFIG_SECTION)

  return {
    apiUrl: workspaceConfig.get<string>(CONFIG_KEYS.API_URL)?.trim() || "",
    apiKey: workspaceConfig.get<string>(CONFIG_KEYS.API_KEY)?.trim() || "",
    model: workspaceConfig.get<string>(CONFIG_KEYS.MODEL)?.trim() || "",
    systemPrompt: workspaceConfig.get<string>(CONFIG_KEYS.SYSTEM_PROMPT) || "",
    promptTemplate: workspaceConfig.get<string>(CONFIG_KEYS.PROMPT_TEMPLATE) || "",
  }
}
