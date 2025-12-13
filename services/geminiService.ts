
import { GoogleGenAI, Type } from "@google/genai";
import { QuizData, QuizConfig, ReportAnalysis, Slide } from "../types";

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

  async chat(history: {role: 'user' | 'model', text: string}[], newMessage: string): Promise<string> {
    if (!apiKey) return "配置错误：缺少 API Key。";

    try {
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
   * Automatically organize unstructured notes into a structured summary.
   */
  async organizeNotes(rawNotes: string): Promise<string> {
    if (!apiKey) return rawNotes + "\n(AI 整理失败：缺少 Key)";

    const prompt = `请将以下杂乱的学习笔记整理成结构清晰、要点明确的格式（使用 Markdown）。
    如果笔记内容较少，请尝试补充相关的背景知识点。
    
    原始笔记：
    ${rawNotes}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || rawNotes;
    } catch (error) {
        console.error("Auto Note Error", error);
        return rawNotes;
    }
  },

  /**
   * Generates a structured Quiz based on config (Topic OR File Content).
   */
  async generateQuiz(config: QuizConfig): Promise<QuizData> {
    if (!apiKey) throw new Error("缺少 API Key");

    const sourceMaterial = config.fileContent 
      ? `基于以下上传的文件内容：\n${config.fileContent.substring(0, 5000)}...` // Truncate if too long
      : `基于主题：${config.topic}`;

    const typeRequirement = config.questionType === 'all' 
      ? "生成单选题和主观简答题混合" 
      : config.questionType === 'multiple_choice' ? "只生成单项选择题" : "只生成主观简答题";

    const prompt = `你是一位资深教师。请${sourceMaterial}，生成一套测试题。
    
    要求：
    1. ${typeRequirement}。
    2. 题目总数量：${config.questionCount} 道。
    3. 语言必须是中文。
    4. 必须严格按照 JSON 格式返回。`;

    try {
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
                    explanation: { type: Type.STRING, description: "Detailed explanation" }
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
   * AI Report Analysis
   */
  async analyzeReport(fileContent: string): Promise<ReportAnalysis> {
    if (!apiKey) throw new Error("缺少 API Key");

    const prompt = `你是一位严谨的学术顾问。请评估以下学生报告的内容：
    
    ${fileContent.substring(0, 8000)}

    请从四个维度评分（0-100分）：主题相关性、逻辑结构完整性、知识点覆盖率、语言规范性。
    并给出总体评分和具体的优化建议（至少3条），以及与优秀范例的对比分析摘要。
    严格返回 JSON。`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scores: {
                            type: Type.OBJECT,
                            properties: {
                                relevance: { type: Type.NUMBER },
                                logic: { type: Type.NUMBER },
                                coverage: { type: Type.NUMBER },
                                style: { type: Type.NUMBER }
                            }
                        },
                        overallScore: { type: Type.NUMBER },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        comparison: { type: Type.STRING }
                    }
                }
            }
        });
        
        return JSON.parse(response.text!) as ReportAnalysis;
    } catch (error) {
        console.error("Report Analysis Error", error);
        throw error;
    }
  },

  /**
   * Generate PPT Structure (Courseware)
   */
  async generateCoursewareSlides(topicOrContent: string): Promise<Slide[]> {
      if (!apiKey) throw new Error("缺少 API Key");
      
      const prompt = `请根据以下内容生成一份教学 PPT 的大纲结构。
      内容/主题：${topicOrContent.substring(0, 5000)}
      
      生成 5-8 页 PPT，每一页包含标题、3-5个关键点（bullet points）以及该页配图的简短描述提示词。
      返回 JSON 数组。`;

      try {
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              id: { type: Type.INTEGER },
                              title: { type: Type.STRING },
                              content: { type: Type.ARRAY, items: { type: Type.STRING } },
                              imagePrompt: { type: Type.STRING }
                          }
                      }
                  }
              }
          });
          return JSON.parse(response.text!) as Slide[];
      } catch (error) {
          console.error("Courseware Gen Error", error);
          throw error;
      }
  },

  async generateAvatar(prompt: string): Promise<string> {
    if (!apiKey) throw new Error("缺少 API Key");
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
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
