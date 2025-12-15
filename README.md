
# 🎓 HITEDU - AI 智能教育平台 (全栈完整版)

欢迎使用 HITEDU！这是一个基于 **React** (前端) + **Node.js Express** (后端) + **Google Gemini** (AI 模型) 构建的现代化智能教育平台。

本项目不仅仅是一个前端演示，它包含了一个**真实的后端服务器**，支持用户注册登录、数据持久化存储、错题本同步和 AI 报告云端保存。

---

## 📋 目录 (Table of Contents)

1. [环境准备](#1-环境准备)
2. [项目结构说明](#2-项目结构说明)
3. [🚀 快速启动指南 (保姆级教程)](#3-🚀-快速启动指南-保姆级教程)
    *   [第一步：启动后端服务器](#第一步启动后端服务器-backend)
    *   [第二步：配置前端环境](#第二步配置前端环境-frontend)
    *   [第三步：启动前端应用](#第三步启动前端应用)
4. [🔑 API Key 配置详解](#4-🔑-api-key-配置详解)
5. [☁️ 公网部署指南 (Deployment)](#5-☁️-公网部署指南-deployment)
6. [💾 数据库与数据持久化](#6-💾-数据库与数据持久化)
7. [🛠️ 常见问题排查 (Troubleshooting)](#7-🛠️-常见问题排查-troubleshooting)

---

## 1. 环境准备

在开始之前，请确保您的电脑已安装以下软件：

*   **Node.js**: 建议版本 v18.0.0 或更高 ([下载地址](https://nodejs.org/))。
*   **npm**: 通常随 Node.js 一起安装。
*   **代码编辑器**: 推荐使用 VS Code。
*   **Google Gemini API Key**: 需要一个有效的 Key ([在此免费获取](https://aistudio.google.com/app/apikey))。

---

## 2. 项目结构说明

本项目包含两个独立的部分，它们需要同时运行：

```text
HITEDU-ROOT/
├── server/              <-- 【后端】Node.js Express 服务器
│   ├── index.js         # 后端启动入口
│   ├── db.json          # (自动生成) JSON 数据库文件
│   └── package.json     # 后端依赖配置
│
├── src/                 <-- 【前端】React 源代码
├── public/
├── package.json         # 前端依赖配置
├── vite.config.ts       # 前端构建配置
├── .env                 # (需手动创建) 存放 API Key
└── README.md            # 说明文档
```

---

## 3. 🚀 快速启动指南 (保姆级教程)

**重要提示：您需要打开两个终端 (Terminal) 窗口。一个跑后端，一个跑前端。**

### 第一步：启动后端服务器 (Backend)

后端负责处理登录、注册和保存数据。

1.  打开**第一个**终端窗口。
2.  进入 `server` 文件夹：
    ```bash
    cd server
    ```
3.  安装后端依赖：
    ```bash
    npm install
    ```
4.  启动服务器：
    ```bash
    npm start
    ```

✅ **成功标志**：
终端输出：`Server running on port 3001`
此时，`server` 目录下会自动生成一个 `db.json` 文件。

> **注意**：请不要关闭这个终端窗口，保持它一直运行。

---

### 第二步：配置前端环境 (Frontend)

前端负责界面展示和调用 Gemini AI。

1.  打开**第二个**终端窗口。
2.  确保您在项目的**根目录** (即 `server` 文件夹的上一级)：
    ```bash
    # 如果您还在 server 目录，请执行:
    cd ..
    ```
3.  安装前端依赖：
    ```bash
    npm install
    ```
4.  **配置环境变量 (关键)**：
    *   **推荐方式**: 在根目录下创建一个新文件，命名为 `.env`，粘贴以下内容（将 `你的Key` 替换为真实的 Gemini API Key）：

    ```env
    VITE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ```
    
    *   **备用方式 (内嵌 Key)**: 如果您无法创建 `.env` 文件或在公网/本地环境下遇到读取问题，可以直接修改 `src/services/geminiService.ts` 文件，将 Key 填入 `EMBEDDED_API_KEY` 常量中。

---

### 第三步：启动前端应用

1.  继续在**第二个**终端窗口中执行：
    ```bash
    npm run dev
    ```

✅ **成功标志**：
终端输出类似：
```text
  VITE v4.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

2.  打开浏览器，访问 `http://localhost:5173` (或终端显示的端口)。

🎉 **恭喜！您现在拥有了一个完整运行的全栈 AI 教育平台。**

---

## 4. 🔑 API Key 配置详解

为了让 AI 功能（如自动出题、AI 助教、语音转录）正常工作，必须正确配置 Key。

*   **文件名**: 必须严格命名为 `.env`，不要叫 `.env.local` 或 `config.js`。
*   **变量名**: 必须使用 `VITE_API_KEY`。前端代码 (`services/geminiService.ts`) 已配置为自动读取此变量。
*   **内嵌 Key**: 在 `services/geminiService.ts` 中找到 `EMBEDDED_API_KEY`，可直接填入字符串。这对于快速演示非常方便。

---

## 5. ☁️ 公网部署指南 (Deployment)

如果要将项目部署到公网 (如 Vercel, Netlify, Render, Railway)，需要注意以下几点：

### 后端部署 (例如 Render, Railway)
1.  确保 `server/package.json` 中的 `scripts` 有 `"start": "node index.js"`。
2.  云平台通常会提供一个动态端口，代码中的 `PORT = process.env.PORT || 3001` 已经适配了这一点。
3.  **注意**: `db.json` 文件存储在部分无服务器平台（如 Vercel Functions）是无法持久化的（重启会丢失数据）。推荐使用支持磁盘持久化的服务（如 Render Disk, Railway Volume）或仅作为演示用途。

### 前端部署 (例如 Vercel, Netlify)
1.  部署时，需要在平台的 **Environment Variables** (环境变量) 设置中添加：
    *   `VITE_API_KEY`: 您的 Gemini API Key。
    *   `VITE_API_BASE_URL`: **这是最关键的一步！** 填入您部署好的后端 URL (例如 `https://my-hitedu-backend.onrender.com/api`)。
2.  如果不设置 `VITE_API_BASE_URL`，前端会默认尝试连接 `http://localhost:3001`，导致在公网访问时报错 "Network Error"。

---

## 6. 💾 数据库与数据持久化

本项目使用文件系统作为轻量级数据库，无需安装 MySQL 或 MongoDB。

*   **存储位置**: `server/db.json`
*   **工作原理**: 后端接收到请求后，会实时读写这个 JSON 文件。
*   **包含数据**:
    *   用户账号 (Users)
    *   视频进度 (Progress)
    *   错题本 (Mistakes)
    *   测验成绩 (Quiz Results)
    *   AI 批改报告 (Reports)
    *   课程表 (Schedules)

---

## 7. 🛠️ 常见问题排查 (Troubleshooting)

### Q1: 点击注册或登录显示 "Network Error" 或没反应？
*   **本地开发**: 检查后端终端是否运行 `npm start`，且端口为 3001。
*   **公网部署**: 检查浏览器的 Console 面板。如果报错 `http://localhost:3001/api/... net::ERR_CONNECTION_REFUSED`，说明你没有配置 `VITE_API_BASE_URL` 环境变量指向真实的后端地址。

### Q2: AI 功能提示 "配置错误：未找到 API Key"？
*   **原因**: `.env` 文件缺失或配置错误。
*   **解决**:
    1.  确保根目录下有 `.env` 文件。
    2.  确保文件内容是 `VITE_API_KEY=AIza...`。
    3.  **修改 .env 后，必须重启前端终端 (`Ctrl+C` 然后再次 `npm run dev`) 才能生效。**
    4.  或者直接使用**内嵌 Key** 方案。

### Q3: 语音笔记无法录音？
*   **原因**: 浏览器权限被拒绝。
*   **解决**: 确保浏览器地址栏允许了麦克风权限。如果是 `http://` 协议，部分浏览器可能限制录音，但在 `localhost` 下通常是允许的。

---

**Designed with ❤️ by HITEDU Team.**
