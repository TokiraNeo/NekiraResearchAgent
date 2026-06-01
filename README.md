# NekiraResearchAgent
A native research agent based on Rust(Tauri) + Typescript(LangGraph)

## 概述
本地智能调研助手。输入一个主题，Agent 自动搜索、阅读、整合，生成结构化调研报告。Plan → Execute → Reflect 循环。

## 状态图示例
```txt
用户输入："调研 Rust 2024  edition 的新特性"
     │
     ▼
┌─────────────────────────────────────┐
│         LangGraph StateGraph        │
│                                     │
│  [plan] ──▶ [search] ──▶ [read] ──▶ │
│     ▲                      │        │
│     │    ┌─────────────────┘        │
│     │    ▼                          │
│     └── [reflect] ◀── [synthesize]  │
│                                     │
│  reflect 判断：信息够了吗？         │
│    ├─ YES → [generate_report]       │
│    └─ NO  → 回到 plan 调整搜索策略  │
└─────────────────────────────────────┘
         │
         ▼
    Tauri 桌面端展示 Markdown 报告
```
