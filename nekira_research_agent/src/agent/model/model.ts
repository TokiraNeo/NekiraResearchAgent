/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

 import { requireEnv, requireJsonEnv } from "@/utility/envUtility";

// ------------------------------------------------------

interface ModelKey {
  baseUrl: string,
  apiKey: string,
}

interface ModelConfig {
  model: string,
  temperature: number,
  maxTokens?: number,
  timeout: number,
}

export type ModelProfileLevel = "mini" | "standard" | "advanced";

type ModelProfileType = Record<ModelProfileLevel, ModelConfig>;

// ------------------------------------------------------

export const modelKey: ModelKey = {
  get baseUrl(): string {
    return requireEnv("VITE_BASE_URL");
  },
  get apiKey(): string {
    return requireEnv("VITE_API_KEY");
  }
};

export const modelProfiles = {
  get profiles(): ModelProfileType {
    return requireJsonEnv<ModelProfileType>("VITE_MODEL_PROFILES");
  }
};
