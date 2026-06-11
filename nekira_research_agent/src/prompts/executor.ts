/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { AIMessage, BaseMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { createModel } from "@/agent/model";
import { resolveTools, type InvocableTool } from "@/agent/tools";
import { AnyPromptDefinition, PromptOutput } from "@/prompts/promptDef";

type ToolCallTrace = {
  step: number;
  tool: string;
  args: unknown;
  result?: unknown;
  error?: string;
  elapsedMs: number;
};

type ToolLoopStopReason = "model-finished" | "max-steps";

type ToolLoopResult = {
  finalText: string;
  trace: ToolCallTrace[];
  stopReason: ToolLoopStopReason;
};

type ToolEnabledRunnable = {
  invoke(messages: BaseMessage[]): Promise<AIMessage>;
};

function stringifyUnknown(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatTraceForFinalizer(trace: ToolCallTrace[]): string {
  if (trace.length === 0) {
    return "- 无";
  }

  return trace
    .map((item) => {
      const lines = [
        `- step=${item.step}, tool=${item.tool}, elapsedMs=${item.elapsedMs}`,
        `  args: ${stringifyUnknown(item.args)}`,
      ];

      if (item.error) {
        lines.push(`  error: ${item.error}`);
      } else {
        lines.push(`  result: ${stringifyUnknown(item.result)}`);
      }

      return lines.join("\n");
    })
    .join("\n");
}

async function invokeTool(
  step: number,
  toolCall: { id?: string; name: string; args: Record<string, unknown> },
  tools: readonly InvocableTool[],
): Promise<{ trace: ToolCallTrace; toolMessage: ToolMessage }> {
  const tool = tools.find((item) => item.name === toolCall.name);
  if (!tool) {
    throw new Error(`Tool "${toolCall.name}" is not found in the current tool set.`);
  }

  const startedAt = Date.now();
  const toolCallId = toolCall.id ?? `tool-call-${step}-${toolCall.name}`;

  try {
    const result = await tool.invoke(toolCall.args);
    const elapsedMs = Date.now() - startedAt;

    return {
      trace: {
        step,
        tool: toolCall.name,
        args: toolCall.args,
        result,
        elapsedMs,
      },
      toolMessage: new ToolMessage({
        content: stringifyUnknown(result),
        tool_call_id: toolCallId,
        status: "success",
        artifact: result,
        metadata: {
          toolName: toolCall.name,
          step,
        },
      }),
    };
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    const errorMessage = error instanceof Error ? error.message : stringifyUnknown(error);

    return {
      trace: {
        step,
        tool: toolCall.name,
        args: toolCall.args,
        error: errorMessage,
        elapsedMs,
      },
      toolMessage: new ToolMessage({
        content: `工具 ${toolCall.name} 执行失败：${errorMessage}`,
        tool_call_id: toolCallId,
        status: "error",
        artifact: {
          error: errorMessage,
        },
        metadata: {
          toolName: toolCall.name,
          step,
        },
      }),
    };
  }
}

async function runToolLoop(
  modelWithTools: ToolEnabledRunnable,
  tools: readonly InvocableTool[],
  prompt: string,
  options?: {
    maxSteps?: number;
    toolChoice?: "auto" | "required";
  },
): Promise<ToolLoopResult> {
  const maxSteps = options?.maxSteps ?? 6;
  const toolChoice = options?.toolChoice ?? "auto";

  const trace: ToolCallTrace[] = [];
  const messages: BaseMessage[] = [new HumanMessage(prompt)];

  let hasAnyToolCall = false;
  let lastAssistantText = "";

  for (let step = 0; step < maxSteps; step += 1) {
    const aiMessage = await modelWithTools.invoke(messages);
    messages.push(aiMessage);

    lastAssistantText = stringifyUnknown(aiMessage.content);
    const toolCalls = aiMessage.tool_calls ?? [];

    if (toolCalls.length === 0) {
      if (toolChoice === "required" && !hasAnyToolCall) {
        throw new Error("Current stage requires at least one tool call, but the model finished without using any tool.");
      }

      return {
        finalText: lastAssistantText,
        trace,
        stopReason: "model-finished",
      };
    }

    hasAnyToolCall = true;

    for (const toolCall of toolCalls) {
      const { trace: itemTrace, toolMessage } = await invokeTool(step, toolCall, tools);
      trace.push(itemTrace);
      messages.push(toolMessage);
    }
  }

  if (toolChoice === "required" && !hasAnyToolCall) {
    throw new Error("Current stage requires at least one tool call, but the tool loop reached max steps without using any tool.");
  }

  return {
    finalText: lastAssistantText,
    trace,
    stopReason: "max-steps",
  };
}

export async function runStructuredPrompt<D extends AnyPromptDefinition>(
  def: D,
  prompt: string,
): Promise<PromptOutput<D>> {
  const modelLevel = def.modelLevel ?? "standard";

  const model = createModel(modelLevel);
  const structuredModel = model.withStructuredOutput(def.outputSchema);

  const response = await structuredModel.invoke(prompt);

  return def.outputSchema.parse(response) as PromptOutput<D>;
}

async function finalizeToolLoopResult<D extends AnyPromptDefinition>(
  def: D,
  originalPrompt: string,
  toolLoopResult: ToolLoopResult,
): Promise<PromptOutput<D>> {
  const model = createModel(def.modelLevel ?? "standard");
  const structuredModel = model.withStructuredOutput(def.outputSchema);

  const response = await structuredModel.invoke(
    [
      "你正在负责将一个带工具调用阶段的中间结果整理为最终结构化输出。",
      "请严格依据现有信息生成结果，不要编造。",
      "如果信息不足，请使用空数组、空字符串或 null 等保守默认值，不要为了凑齐字段而虚构内容。",
      "",
      "原始阶段任务：",
      originalPrompt,
      "",
      "工具循环停止原因：",
      toolLoopResult.stopReason === "model-finished" ? "模型自然结束" : "达到最大工具调用轮次",
      "",
      "模型最后回复：",
      toolLoopResult.finalText || "（空）",
      "",
      "工具调用轨迹：",
      formatTraceForFinalizer(toolLoopResult.trace),
    ].join("\n"),
  );

  return def.outputSchema.parse(response) as PromptOutput<D>;
}

export async function runToolEnabledPrompt<D extends AnyPromptDefinition>(
  def: D,
  prompt: string,
): Promise<PromptOutput<D>> {
  const executionMode = def.executionMode ?? "structured";
  if (executionMode !== "tool-enabled") {
    throw new Error(`Prompt "${def.id}" is not configured as a tool-enabled prompt.`);
  }

  if (!def.toolSetId || def.toolSetId === "none") {
    throw new Error(`Tool-enabled prompt "${def.id}" must declare a non-empty toolSetId.`);
  }

  const tools = resolveTools(def.toolSetId);
  if (tools.length === 0) {
    throw new Error(`Tool-enabled prompt "${def.id}" resolved no tools from toolSetId "${def.toolSetId}".`);
  }

  const model = createModel(def.modelLevel ?? "standard");
  const modelWithTools = model.bindTools(tools) as ToolEnabledRunnable;

  const toolLoopResult = await runToolLoop(modelWithTools, tools, prompt, {
    toolChoice: def.toolChoice ?? "auto",
  });

  return finalizeToolLoopResult(def, prompt, toolLoopResult);
}
