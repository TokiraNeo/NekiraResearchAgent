/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { add, multiply } from "@/agent/tools/utilities/exampleTool";

export const toolsRegistry = {
  [add.name]: add,
  [multiply.name]: multiply,
} as const;

type ToolName = keyof typeof toolsRegistry;

const toolsSet = {
  "none": [] as ToolName[],
  "default": ["add", "multiply"] as ToolName[],
  "search": [] as ToolName[], // 搜索工具集合（示例中暂时为空）
  "read": [] as ToolName[],   // 阅读工具集合（示例中暂时为空）
};

export type ToolSetId = keyof typeof toolsSet;

// 工具最小契约
export interface InvocableTool {
  name: string;
  invoke(args: any): Promise<any>;
}

export function resolveTools(id: ToolSetId): InvocableTool[] {
  if (!id || id === "none") {
    return [];
  }

  const toolNames = toolsSet[id];
  if (!toolNames) {
    throw new Error(`ToolSetId "${id}" is not defined in toolsSet.`);
  }

  const tools = toolNames.map((
    (name) => {
      const tool = toolsRegistry[name];
      if (!tool) {
        throw new Error(`Tool "${name}" is not defined in toolsRegistry.`);
      }
      return tool;
    }
  ));

  return tools;
}
