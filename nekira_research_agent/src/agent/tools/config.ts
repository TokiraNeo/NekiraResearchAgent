/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { requireJsonEnv } from "@/utility/envUtility";

interface ToolConfig {
  tavilyAPI?: string;
}

export const toolConfig = {
  get config(): ToolConfig {
    return requireJsonEnv<ToolConfig>("VITE_TOOL_CONFIG");
  },
};
