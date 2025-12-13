
# 🎓 HITEDU 智能教育平台 - 期末项目报告

**项目名称**: HITEDU (Hybrid Intelligence Education Platform)  
**开发团队**: HITEDU Dev Team  
**报告日期**: 2025年

---

## 1. 系统功能说明 (System Overview)

### 1.1 项目背景与概述
HITEDU 是一个集成了 Google Gemini 生成式 AI 技术的现代化全栈教育平台。系统采用 **B/S (Browser/Server)** 架构，实现了前后端分离。项目旨在解决传统在线教育互动性差、反馈滞后的痛点，通过 AI 赋能，提供个性化学习路径、实时智能辅助、自动化出题与批改以及多维度的学情分析。

平台设计了**学生 (Student)** 和 **教师 (Teacher)** 双端角色：
*   **学生端**: 专注沉浸式学习，包含智能视频播放器、语音笔记、AI 助教答疑及自适应测验。
*   **教师端**: 专注教学管理，包含课程内容分发、可视化班级学情监控及教学资源管理。

---

### 1.2 核心技术栈详解 (Detailed Technology Stack)

本项目采用现代化的 **MERN 变体架构** (React + Node.js + Express + Gemini AI)，各层级技术选型细节如下：

#### A. 前端架构 (Frontend Architecture)

*   **核心框架**: **React 18**
    *   采用 **Functional Components** (函数式组件) + **Hooks** 编程范式，确保代码的简洁性与可复用性。
    *   **DOM 渲染**: 使用 `react-dom/client` 的 `createRoot` API，启用 React 18 的并发渲染特性 (Concurrent Mode)。
*   **构建工具**: **Vite**
    *   利用 ES Modules 实现极速冷启动和 HMR (热模块替换)，显著提升开发体验。
*   **开发语言**: **TypeScript (v5.x)**
    *   全项目采用强类型约束，定义了详尽的接口 (`types.ts`) 如 `User`, `Video`, `QuizData`，有效规避了运行时类型错误，提升了代码的可维护性。
*   **路由管理**: **Custom State-Based Routing**
    *   未引入传统的 `react-router-dom`，而是通过 `App.tsx` 中的 `ViewState` 枚举与 React State (`useState`) 结合，实现了轻量级的单页应用 (SPA) 视图切换，减少了包体积。

#### B. UI/UX 与视觉渲染 (Visual Rendering)

*   **CSS 框架**: **Tailwind CSS**
    *   采用 Utility-First (原子化) CSS 设计理念，实现快速响应式布局 (`flex`, `grid`, `md:`, `lg:` 断点控制)。
*   **视觉风格**: **Liquid Glass UI (液态毛玻璃)**
    *   **混合样式策略**: 结合 Tailwind 与原生 CSS (`index.html`)。
    *   **核心技术**: 大量使用 `backdrop-filter: blur()`, `rgba` 透明度叠加, 以及 CSS3 Keyframe 动画 (`animate-gradient-xy`, `float`)，打造现代化、通透的界面质感。
*   **3D 渲染引擎**: **React Three Fiber (R3F)**
    *   **底层库**: `Three.js` + `@react-three/fiber` + `@react-three/drei`。
    *   **实现**: 在 `components/LiquidChrome.tsx` 中通过 Shader Material (`MeshTransmissionMaterial`) 实现了高性能的 WebGL 液体金属背景效果，增强视觉沉浸感。
*   **图标库**: **Lucide React**
    *   使用轻量级、风格统一的 SVG 图标组件。

#### C. 后端服务层 (Backend Service Layer)

*   **运行环境**: **Node.js** (JavaScript Runtime)。
*   **Web 框架**: **Express.js**
    *   构建 RESTful API，处理前端 HTTP 请求 (GET, POST)。
    *   **中间件配置**:
        *   `cors`: 解决跨域资源共享问题，允许前端 `localhost:5173` 访问后端 API。
        *   `body-parser`: 配置 `{ limit: '50mb' }`，支持 Base64 图片和大文本数据的传输（用于上传头像、作业文档）。
*   **数据持久化 (Persistence Layer)**: **File-System Based JSON DB**
    *   **实现原理**: 不依赖大型数据库软件 (MySQL/Mongo)，通过 Node.js 原生 `fs` (File System) 模块读写 `server/db.json` 文件。
    *   **数据模型**: 模拟 NoSQL 文档结构，包含 `users`, `videos`, `progress`, `mistakes`, `quizResults` 等集合。
    *   **优势**: 部署极简，零配置成本，适合课程项目演示；支持热更新与数据持久保存。

#### D. 人工智能引擎 (Generative AI Engine)

*   **SDK**: **Google GenAI SDK** (`@google/genai`)
    *   直接在前端与 Google Gemini API 通信（部分场景）及后端集成。
*   **核心模型应用**:
    *   **Gemini 2.5 Flash**: 主力模型，用于处理高并发、低延迟的文本逻辑任务。
        *   *Prompt Engineering*: 使用 **Few-Shot Prompting** 和 **Role Prompting** (如“你是一位严谨的学术顾问”) 优化输出。
        *   *Structured Output*: 利用 `responseSchema` 和 `responseMimeType: "application/json"` 强制模型输出严格的 JSON 格式，确保前端能准确渲染 AI 生成的题目和报告。
    *   **Gemini 2.5 Flash Image**: 多模态模型，用于根据文本提示词 (`prompt`) 生成用户个性化头像 (`StudentProfile.tsx`)。
*   **RAG (检索增强生成) 模拟**:
    *   在 `OnlineTutoring` 和 `AIReport` 模块中，将用户上传的本地文档内容作为 Context (上下文) 注入 Prompt，实现了基于特定知识库的问答与分析。

#### E. 多媒体与浏览器原生 API (Web APIs)

*   **Audio API**:
    *   使用 `navigator.mediaDevices.getUserMedia` 获取麦克风权限。
    *   使用 `MediaRecorder` 录制音频流并转换为 Blob 对象，配合 Gemini 多模态能力实现语音转文字 (`VoiceNote.tsx`)。
*   **Video Playback**:
    *   基于 HTML5 `<video>` 元素封装 `SmartVideoPlayer`。
    *   通过监听 `timeupdate` 事件实现毫秒级的进度追踪、字幕同步渲染及随堂小测 (`quizzes` 触发器) 的自动弹出。

---

### 1.3 核心交互流程 (Core User Flows)

#### 1. 智能视频学习流
> 用户点击课程 -> 初始化播放器 -> 实时同步进度至后端 -> 触发时间轴事件 (Quiz/Subtitle) -> 用户语音录入笔记 -> AI 转录并整理 -> 笔记保存。

#### 2. AI 自适应出题流
> 用户输入主题/上传文档 -> 前端构建 Prompt (含 Schema 约束) -> 调用 Gemini API -> 获得 JSON 试题数据 -> 渲染交互式答题卡 -> 自动判分 -> 错题数据回传后端 -> 生成学情画像。

#### 3. 数字化作业批改流
> 学生上传作业 (TXT/MD) -> 读取文件内容 -> 组装分析 Prompt -> Gemini 多维度打分 (逻辑/覆盖率/规范性) -> 返回结构化报告 -> 可视化图表渲染 -> 报告云端存档。

---

## 2. 系统安装与操作说明

### 2.1 环境配置要求 (Prerequisites)
*   **Node.js**: v18.0.0 或更高版本 (必需，用于运行 JS 运行时)。
*   **npm**: v9.0.0+ (包管理器)。
*   **浏览器**: Chrome/Edge (建议最新版，以支持 WebGL 和 ES6 特性)。
*   **API Key**: Google Gemini API Key (需在 `.env` 文件中配置)。

### 2.2 部署步骤 (Deployment Guide)

本项目分为 **Server (后端)** 和 **Client (前端)** 两个独立工程，需分别启动。

#### 步骤一：启动后端数据服务
1.  打开终端 (Terminal)，进入后端目录：
    ```bash
    cd server
    ```
2.  安装后端依赖库 (Express, Cors, Multer 等)：
    ```bash
    npm install
    ```
3.  启动 Express 服务器：
    ```bash
    npm start
    ```
    *   **成功验证**: 终端显示 `Server running on http://localhost:3001`。
    *   *注*: 系统会自动在 `server/` 目录下创建 `db.json` 初始化数据库。

#### 步骤二：启动前端应用
1.  打开新的终端窗口，进入项目根目录：
    ```bash
    cd ..  # 如果当前在 server 目录，需返回上一级
    ```
2.  安装前端依赖库 (React, Typescript, Vite, Three.js, Lucide 等)：
    ```bash
    npm install
    ```
3.  **关键配置**: 配置环境变量
    *   在根目录新建文件 `.env`。
    *   写入 API Key (注意不要带引号):
        ```env
        VITE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxx
        ```
4.  启动开发服务器：
    ```bash
    npm run dev
    ```
    *   **成功验证**: 终端显示 `Local: http://localhost:5173/`。

### 2.3 用户操作手册 (User Manual)

1.  **访问平台**: 浏览器打开 `http://localhost:5173`。
2.  **身份认证**:
    *   推荐点击“免费注册”，分别注册一个“学生账号”和一个“教师账号”以体验不同视角。
    *   登录后，Token (模拟) 将存储于 LocalStorage。
3.  **学生端体验**:
    *   **AI 出题**: 进入“AI 智能出题”，上传本地 TXT 笔记，选择“5题+单选”，体验 AI 基于文档内容的精准出题。
    *   **视频交互**: 观看《计算机科学导论》，在第 10 秒会自动暂停弹出测试题；点击右侧话筒录制语音笔记。
    *   **学情画像**: 进入“个人中心”，查看 AI 基于您的做题记录生成的个性化评语和雷达图。
4.  **教师端体验**:
    *   登录教师账号，进入“教师工作台”。
    *   在“发布课程”页签，填写元数据并发布新视频（模拟上传）。
    *   在“班级学情”页签，查看全班的学习活跃度热力图。

---


