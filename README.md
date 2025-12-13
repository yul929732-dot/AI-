
# HITEDU - AI 智能教育平台

这是一个基于 React (前端) 和 Node.js Express (后端) 的全栈智能教育平台项目。集成 Google Gemini API 实现 AI 助教、视频理解、智能笔记和出题功能。

## 🚀 项目架构

*   **Frontend**: React + TypeScript + Tailwind CSS
*   **Backend**: Node.js + Express + JSON File DB (用于模拟真实数据库持久化)
*   **AI**: Google Gemini API (@google/genai)

## 🛠️ 本地运行配置指南 (Environment Setup)

要在您的本地电脑或其他服务器上运行此项目，请按照以下步骤操作。

### 1. 前置要求

*   安装 [Node.js](https://nodejs.org/) (建议版本 v18 或更高)
*   拥有一个有效的 Google Gemini API Key

### 2. 获取代码

将本项目下载或 Clone 到本地目录。

### 3. 配置后端 (Backend)

后端负责处理用户登录、视频数据存储和学习记录。

1.  进入 server 目录：
    ```bash
    cd server
    ```
2.  安装依赖：
    ```bash
    npm install
    ```
3.  启动后端服务器：
    ```bash
    npm start
    ```
    *服务器将运行在 `http://localhost:3001`。数据将自动保存在 `server/db.json` 文件中。*

### 4. 配置前端 (Frontend)

前端负责界面交互和直接调用 Gemini API。

1.  回到项目根目录 (如果还在 server 目录，请执行 `cd ..`)。
2.  安装依赖：
    ```bash
    npm install
    ```
3.  **配置环境变量 (关键步骤)**：
    *   在根目录创建一个名为 `.env` 的文件。
    *   参考 `.env.example` 的内容，填入您的 API Key。
    *   文件内容示例：
        ```env
        # 如果使用 Vite 构建 (推荐)
        VITE_API_KEY=your_actual_gemini_api_key_here
        
        # 如果使用 Webpack/CRA 构建
        REACT_APP_API_KEY=your_actual_gemini_api_key_here
        ```
    *   *注意：代码已适配自动识别 `process.env.API_KEY` 或 `VITE_API_KEY`。*

4.  启动前端开发服务器：
    ```bash
    npm run dev
    # 或者
    npm start
    ```
    *前端通常运行在 `http://localhost:3000` 或 `http://localhost:5173`。*

## 💡 功能验证

1.  **注册/登录**：确保后端服务器(Port 3001)已启动。在前端页面点击“注册”，系统会向后端发送请求并将用户数据写入 `server/db.json`。重启服务器后数据依然存在。
2.  **AI 功能**：进入“个人中心”生成画像，或使用“AI 助教”。如果配置了正确的 `.env` API Key，系统将直接调用 Gemini 模型并返回结果。

## 📦 发布与部署

*   **前端**：执行 `npm run build` 生成静态文件，可部署至 Vercel, Netlify 或 Nginx。
*   **后端**：将 `server` 目录部署至云服务器 (如 AWS EC2, DigitalOcean) 并使用 PM2 运行。确保前端代码中的 `API_BASE` 指向真实的后端 IP 地址。

## ⚠️ 常见问题

*   **注册显示"Network Error"**：请检查 `server` 目录下的 `npm start` 是否运行正常。
*   **AI 无响应**：请检查浏览器控制台 (F12) -> Network，确认是否成功向 Google API 发送请求。如果失败，可能是 API Key 无效或网络环境问题。
