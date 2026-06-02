/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { modelFactory } from "@/agent/model/factory";
import { exampleTools } from "@/agent/tools/index"
import { ModelProfileLevel } from "@/agent/model/model";

export function CreateModel(level: ModelProfileLevel) {
  return modelFactory.getClient(level);
}

export function CreateModelWithTools(level: ModelProfileLevel, bindTools = exampleTools) {
  const model = modelFactory.getClient(level);
  return model.bindTools(bindTools);
}
