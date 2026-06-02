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
  "search": [] as ToolName[], // 搜索工具集合（示例中暂时为空）
  "read": [] as ToolName[],   // 阅读工具集合（示例中暂时为空）
};

export type ToolSetId = keyof typeof toolsSet;

// 默认的示例工具集合
const exampleToolsMap = {
  [add.name]: add,
  [multiply.name]: multiply,
}
export const exampleTools = Object.values(exampleToolsMap);
