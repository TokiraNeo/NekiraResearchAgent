/*
 * NekiraResearchAgent - Native Research Agent (Rust + Tauri + LangGraph).
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

 // 该脚本从 .env.example 复制生成 .env 文件

import { existsSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, ".env.example");
const target = resolve(root, ".env");

const bForce = process.argv.includes("--force");

if (!existsSync(source)) {
  console.error("未找到 .env.example，请先创建模板文件。");
  process.exit(1);
}

if (existsSync(target) && !bForce) {
  console.log(".env 已存在，跳过生成。若需覆盖请使用 --force。");
  process.exit(0);
}

copyFileSync(source, target);
console.log(`已生成: ${target}`);
