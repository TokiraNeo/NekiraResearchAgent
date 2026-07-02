/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function requireEnv(name: string): string {
  const value = import.meta.env[name];

  if (!value || !String(value).trim()) {
    throw new Error(`Missing environment variable ${name} .`);
  }

  return String(value).trim();
}

export function requireJsonEnv<T>(name: string): T {
  const value = requireEnv(name);

  try {
    return JSON.parse(value) as T;
  }
  catch (e) {
    throw new Error(`Invalid JSON in environment variable ${name} : ${e}`);
  }
}
