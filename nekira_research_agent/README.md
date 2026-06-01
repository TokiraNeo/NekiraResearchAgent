# NekiraResearchAgent

---

## 1. `.env` 生成脚本使用说明

本项目提供了一个用于生成环境变量文件的脚本：`src/scripts/generateEnv.ts`。

### 作用
- 从项目根目录的 `.env.example` 复制生成 `.env`
- 如果 `.env` 已存在，默认不覆盖
- 可通过 `--force` 强制覆盖

### 可用命令
在 [package.json](d:\UGit\TokiraNeo\NekiraResearchAgent\nekira_research_agent\package.json) 中已配置：

```bash
npm run env:init
```
- 首次初始化 `.env`
- 当 `.env` 已存在时会跳过并提示

```bash
npm run env:reset
```
- 强制用 `.env.example` 重新生成 `.env`
- 会覆盖现有 `.env`

### 使用步骤
1. 先确保项目根目录存在 `.env.example`
2. 执行 `npm run env:init`
3. 打开 `.env`，按实际环境填写变量值

### 注意事项
- 该脚本基于 Node.js 运行，命令本质为：`node src/scripts/generateEnv.ts`
- 若提示“未找到 `.env.example`”，请先创建该模板文件

---
