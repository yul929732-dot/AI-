import { GoogleGenAI, Type } from "@google/genai";
import {
  QuizData,
  QuizConfig,
  ReportAnalysis,
  Slide,
  LearningStats,
  MistakeRecord
} from "../types";

/**
 * ===============================
 * Gemini API Key 获取逻辑
 * ===============================
 */

// 👉 如果你不想用 .env，可以直接把 Key 填在这里
const EMBEDDED_API_KEY = ""; // 例如: "AIzaSy..."

const getApiKey = (): string => {
  // 1️⃣ Vite 环境变量（推荐）
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_KEY
  ) {
    return import.meta.env.VITE_API_KEY;
  }

  // 2️⃣ 内嵌 Key（兜底）
  if (EMBEDDED_API_KEY) {
    return EMBEDDED_API_KEY;
  }

  return "";
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * ===============================
 * Gemini Service
 * ===============================
 */
export const geminiService = {
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!ai) {
      return "未配置 API Key，请在 .env 中设置 VITE_API_KEY";
    }

    try {
      const base64Audio = await blobToBase64(audioBlob);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: audioBlob.type || "audio/webm",
                data: base64Audio
              }
            },
            { text: "请准确转录这段音频内容（中文为主）。" }
          ]
        }
      });

      return response.text || "未获取到转录内容";
    } catch (err) {
      console.error(err);
      return "音频转录失败";
    }
  },

  async chat(
    history: { role: "user" | "model"; text: string }[],
    newMessage: string
  ): Promise<string> {
    if (!ai) return "未配置 API Key";

    const prompt = `
你是一个专业的 AI 助教，请用简洁、清晰的语言回答问题。

历史对话：
${history
  .map(h => `${h.role === "user" ? "学生" : "助教"}：${h.text}`)
  .join("\n")}

学生：${newMessage}
助教：
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      return response.text || "暂时无法回答";
    } catch (err) {
      console.error(err);
      return "对话失败";
    }
  },

  async organizeNotes(rawNotes: string): Promise<string> {
    if (!ai) return rawNotes;

    const prompt = `
请将以下学习笔记整理成结构清晰的 Markdown 笔记：

${rawNotes}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      return response.text || rawNotes;
    } catch (err) {
      console.error(err);
      return rawNotes;
    }
  },

  async generateQuiz(config: QuizConfig): Promise<QuizData> {
    if (!ai) throw new Error("缺少 API Key");

    const source = config.fileContent
      ? `基于以下文件内容：\n${config.fileContent.slice(0, 5000)}`
      : `基于主题：${config.topic}`;

    const prompt = `
你是一名教师，请 ${source} 生成测试题。
题目数量：${config.questionCount}
语言：中文
格式：JSON
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "type", "question", "explanation"]
              }
            }
          },
          required: ["title", "questions"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as QuizData;
  },

  async analyzeReport(fileContent: string): Promise<ReportAnalysis> {
    if (!ai) throw new Error("缺少 API Key");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fileContent
    });

    return JSON.parse(response.text || "{}") as ReportAnalysis;
  },

  async generateCoursewareSlides(topic: string): Promise<Slide[]> {
    if (!ai) throw new Error("缺少 API Key");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: topic
    });

    return JSON.parse(response.text || "[]") as Slide[];
  },

  async generateLearningProfile(
    stats: LearningStats,
    mistakes: MistakeRecord[]
  ): Promise<string> {
    if (!ai) return "未配置 API Key";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "根据学习数据生成学习画像"
    });

    return response.text || "";
  }
};

/**
 * ===============================
 * 工具函数
 * ===============================
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
