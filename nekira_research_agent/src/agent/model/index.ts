/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { modelFactory } from "@/agent/model/factory";
import { ModelProfileLevel } from "@/agent/model/model";

export function createModel(level: ModelProfileLevel) {
  return modelFactory.getClient(level);
}
