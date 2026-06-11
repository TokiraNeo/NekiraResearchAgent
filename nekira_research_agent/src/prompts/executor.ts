/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { AnyPromptDefinition, AnyPromptMap, PromptOutput } from "@/prompts/promptDef";
import { createModel } from "@/agent/model";
import { resolveTools, InvocableTool } from "@/agent/tools";

export async function runStructuredPrompt<
  T extends AnyPromptMap,
  K extends keyof AnyPromptMap,
  D extends AnyPromptDefinition
  >(def: D, prompt: string): Promise<PromptOutput<T[K]>> {
  const modelLevel = def.modelLevel ?? "standard";

  const model = createModel(modelLevel);
  const structuredModel = model.withStructuredOutput(def.outputSchema);

  const response = await structuredModel.invoke(prompt);

  return def.outputSchema.parse(response) as PromptOutput<T[K]>;
}

export async function runToolEnablePrompt<
  T extends AnyPromptMap,
  K extends keyof AnyPromptMap,
  D extends AnyPromptDefinition
  >(def: D, prompt: string): Promise<PromptOutput<T[K]>> {
  const modelLevel = def.modelLevel ?? "standard";

  const model = createModel(modelLevel);

  const toolSetId = def.toolSetId ?? "default";
  //const toolChoice = def.toolChoice ?? "auto";

  const tools = resolveTools(toolSetId);

  const toolEnableModel = model.bindTools(tools);

  const toolLoopResult = await runToolLoop(toolEnableModel, model, tools, prompt);

  const finalOutput = await finalizeToolLoopResult(def, toolLoopResult.finalText);

  return finalOutput;
}

type ToolCallTrace = {
  tool: string;
  args: any;
  result: any;
}

type ToolLoopResult = {
  finalText: string;
  trace: ToolCallTrace[];
}

// 模型最小契约
interface InvocableModel {
  invoke(messages: any[]): Promise<{ content: any; tool_calls?: any[] }>;
}

// 带工具绑定的模型
interface ToolBoundModel extends InvocableModel {}

// 执行工具调用循环
async function runToolLoop(modelWithTools: ToolBoundModel, fallbackModel: InvocableModel, tools: InvocableTool[], prompt: string, maxSteps = 6): Promise<ToolLoopResult> {
  const trace: ToolCallTrace[] = [];
  const messages: any[] = [
    {role: "user", content: prompt}
  ];

  for (let step = 0; step < maxSteps; ++step) {
    const aiMessage = await modelWithTools.invoke(messages);
    // ChatOpenAI返回的AIMessage结构:
    // {role: "assistant", content: "string" | Object, tool_calls: [{id, name, args}]}
    messages.push(aiMessage);

    const toolCalls = aiMessage.tool_calls ?? [];

    if (!toolCalls.length) {
      const finalText = typeof aiMessage.content === "string"
        ? aiMessage.content
        : JSON.stringify(aiMessage.content);

      return { finalText, trace };
    }

    for (const toolCall of toolCalls) {
      const { name, args } = toolCall;

      const tool = tools.find((t) => t.name === name);

      if (!tool) {
        throw new Error(`Tool "${name}" is not found in the model's bound tools.`);
      }

      const result = await tool.invoke(args);

      trace.push({ tool: name, args, result });

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: typeof result === "string" ? result : JSON.stringify(result),
      });
    }
  }

  // 达到最大步数仍未自然结束时，进行一次无工具收尾
  messages.push({
    role: "user",
    content: "已达到最大工具调用轮次，请基于以上所有工具返回结果，直接输出最终结论，不要再调用工具。"
  });

  const finalMessage = await fallbackModel.invoke(messages);

  const finalText = typeof finalMessage.content === "string"
    ? finalMessage.content
    : JSON.stringify(finalMessage.content);

  return { finalText, trace };
}

// 格式化工具调用的最终输出
async function finalizeToolLoopResult<
  T extends AnyPromptMap,
  K extends keyof AnyPromptMap,
  D extends AnyPromptDefinition
  >(def: D, rawText: string): Promise<PromptOutput<T[K]>> {
  const model = createModel(def.modelLevel ?? "standard");
  const structuredModel = model.withStructuredOutput(def.outputSchema);

  const result = await structuredModel.invoke(
    `
    请将下面内容格式化为符合输出schema的结构：

    原始内容：
    ${rawText}
    `.trim()
  );

  return def.outputSchema.parse(result) as PromptOutput<T[K]>;
}
