/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

 import {add, multiply} from "@/agent/tools/utilities/exampleTool";

// 默认的示例工具集合
const exampleToolsMap = {
  [add.name]: add,
  [multiply.name]: multiply,
}
export const exampleTools = Object.values(exampleToolsMap);
