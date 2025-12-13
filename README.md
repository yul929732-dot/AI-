
# HITEDU - AI 智能教育平台 (全栈版)

这是一个功能完备的智能教育平台，集成了 React 前端、Node.js Express 后端和 Google Gemini AI。

## ⚠️ 核心提示：如何启动后端 (Node/Express)

为了体验完整的“注册、登录、数据保存”功能，**您必须启动后端服务器**。此代码包含真实的 `server/index.js`，它充当您的后端 API 和数据库。

### 1. 启动后端服务器 (Terminal 1)

打开一个新的终端窗口，执行以下命令：

```bash
cd server
npm install  # 首次运行需要安装依赖
npm start    # 启动 Node 服务器
```

✅ **成功标志**：终端显示 `Server running on http://localhost:3001`。
此时，`server/db.json` 文件会被自动创建，用来存储所有的用户数据、错题本、测验成绩和 AI 报告。

---

### 2. 启动前端应用 (Terminal 2)

打开另一个终端窗口，回到项目根目录：

```bash
# 如果在 server 目录，请先返回上一级
cd ..

npm install  # 安装前端依赖
npm run dev  # 启动 React 前端
```

---

### 3. 配置 API Key (重要)

为了让 AI 助教、自动出题和报告分析功能工作，您需要配置 Gemini API Key。

1.  在项目根目录创建一个 `.env` 文件。
2.  填入您的 Key：
    ```env
    VITE_API_KEY=AIzaSy...您的真实Key...
    ```

## 🌟 功能模块说明

### 1. 登录注册模块 (Backend Supported)
*   **后端文件**: `server/index.js` 中的 `/api/auth/register` 和 `/api/auth/login`。
*   **功能**: 支持学生/教师双角色注册。数据持久化存储在 `server/db.json`。
*   **特性**: 如果后端未启动，前端会自动切换到 Mock 模式，保证演示不中断，但在 Mock 模式下刷新页面数据会丢失。**请务必启动后端以持久保存数据。**

### 2. 视频点播与进度追踪 (Backend Supported)
*   **功能**: 观看视频，后端自动记录观看进度。
*   **API**: `POST /api/users/:uid/progress`。

### 3. AI 助教 (Gemini API)
*   **功能**: 位于“线上课程辅导”模块。
*   **实现**: 前端直接调用 Gemini 2.5 Flash 模型，支持多轮对话上下文记忆。

### 4. AI 智能出题 (Gemini + Backend)
*   **功能**: 上传文档或输入主题，AI 自动生成试卷。
*   **新特性**: 考完试后，系统会自动调用 `POST /api/users/:id/quiz-results` 将成绩永久保存到后端数据库。

### 5. AI 批改与报告 (Gemini + Backend)
*   **功能**: 上传作业文本，AI 从四个维度进行评分。
*   **新特性**: 点击“保存报告到云端”，报告将被存入 `server/db.json`，随时可查。

## 📂 数据库说明

本项目使用轻量级文件数据库 `server/db.json`。
*   您不需要安装 MySQL 或 MongoDB。
*   所有的数据（用户、错题、成绩、报告）都保存在这个 JSON 文件中。
*   您可以直接打开这个文件查看保存的数据。

## 🛠️ 技术栈

*   **Frontend**: React, Tailwind CSS, TypeScript
*   **Backend**: Node.js, Express
*   **Database**: LowDB-style JSON file storage
*   **AI**: Google Gemini API (@google/genai)
