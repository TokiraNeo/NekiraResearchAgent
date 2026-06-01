/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

function requireEnv(name: string): string {
  const value = import.meta.env[name];

  if (!value || !String(value).trim()) {
    throw new Error(`Missing environment variable ${name} .`);
  }

  return String(value).trim();
}

function requireJsonEnv<T>(name: string): T {
  const value = requireEnv(name);

  try {
    return JSON.parse(value) as T;
  }
  catch (e) {
    throw new Error(`Invalid JSON in environment variable ${name} : ${e}`);
  }
}

// ------------------------------------------------------

interface ModelKey {
  baseUrl: string,
  apiKey: string,
}

interface ModelConfig {
  model: string,
  temperature: number,
  maxTokens: number,
  timeout: number,
}

export type ModelProfileLevel = "mini" | "standard" | "advanced";

type ModelProfileType = Record<ModelProfileLevel, ModelConfig>;

// ------------------------------------------------------

export const modelKey: ModelKey = {
  baseUrl: requireEnv("VITE_BASE_URL"),
  apiKey: requireEnv("VITE_API_KEY"),
}

export const modelProfiles = requireJsonEnv<ModelProfileType>("VITE_MODEL_PROFILES");
