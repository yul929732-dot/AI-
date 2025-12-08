
import { GoogleGenAI, Type } from "@google/genai";
import { QuizData } from "../types";

// NOTE: In a real production app, you should not expose API keys on the client side.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  /**
   * Transcribes audio using Gemini 2.5 Flash.
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!apiKey) return "错误：缺少 API Key。";

    try {
      const base64Audio = await blobToBase64(audioBlob);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: audioBlob.type || 'audio/webm', data: base64Audio } },
            { text: "请准确转录这段音频的内容（主要是中文）。如果是空白或噪音，请直接说明。" }
          ]
        }
      });
      return response.text || "无法获取转录内容。";
    } catch (error) {
      console.error("Gemini Transcription Error:", error);
      return "转录失败，请重试。";
    }
  },

  /**
   * Chat with AI Assistant using simple text-based history.
   */
  async chat(history: {role: 'user' | 'model', text: string}[], newMessage: string): Promise<string> {
    if (!apiKey) return "配置错误：缺少 API Key。";

    try {
      // Construct prompt with history
      const prompt = `你是一个专业的AI助教。请简洁、准确地回答学生的问题。
      
      历史对话:
      ${history.map(h => `${h.role === 'user' ? '学生' : '助教'}: ${h.text}`).join('\n')}
      
      学生: ${newMessage}
      助教:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return response.text || "抱歉，我暂时无法回答。";
    } catch (error) {
      console.error("Chat Error:", error);
      return "网络连接异常，请稍后再试。";
    }
  },

  /**
   * Generates a structured Quiz based on user topic/content.
   */
  async generateQuiz(topic: string): Promise<QuizData> {
    if (!apiKey) throw new Error("缺少 API Key");

    const prompt = `你是一位资深教师。请根据以下内容或主题，生成一套测试题。
    主题/内容：${topic}
    
    要求：
    1. 生成 3 道单项选择题 (multiple_choice)。
    2. 生成 1 道主观简答题 (subjective)。
    3. 语言必须是中文。
    4. 必须严格按照 JSON 格式返回。`;

    try {
      // Define the schema using the Google GenAI SDK format
      // Note: We use the SDK's expected Type structure (SchemaType is deprecated)
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "测验的标题" },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["multiple_choice", "subjective"] },
                    question: { type: Type.STRING },
                    options: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING },
                      description: "For multiple choice only, list 4 options"
                    },
                    correctAnswer: { 
                      type: Type.INTEGER,
                      description: "For multiple choice only, index (0-3) of the correct answer"
                    },
                    explanation: { type: Type.STRING, description: "Detailed explanation of the answer" }
                  },
                  required: ["id", "type", "question", "explanation"]
                }
              }
            },
            required: ["title", "questions"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");
      return JSON.parse(text) as QuizData;

    } catch (error) {
      console.error("Quiz Generation Error:", error);
      throw new Error("生成题目失败，请重试。");
    }
  },

  /**
   * Generates an avatar image based on a prompt.
   */
  async generateAvatar(prompt: string): Promise<string> {
    if (!apiKey) throw new Error("缺少 API Key");
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
        config: {
           // nano banana models don't support responseMimeType
        }
      });
      
      // Look for inlineData in parts
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
           // Default mimeType usually image/png or image/jpeg
           const mime = part.inlineData.mimeType || 'image/png';
           return `data:${mime};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data returned from Gemini");
    } catch (error) {
      console.error("Avatar Generation Error:", error);
      throw error;
    }
  }
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
