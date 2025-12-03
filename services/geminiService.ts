import { GoogleGenAI } from "@google/genai";

// NOTE: In a real production app, you should not expose API keys on the client side.
// This is for demonstration purposes or internal tools where environment variables are safe.
// Assuming process.env.API_KEY is available.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  /**
   * Transcribes audio using Gemini 2.5 Flash.
   * @param audioBlob The audio blob recorded from the microphone.
   * @returns The transcribed text.
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!apiKey) {
      console.warn("API Key is missing. Returning mock response.");
      return "Error: Gemini API Key is missing in the environment configuration.";
    }

    try {
      // Convert Blob to Base64
      const base64Audio = await blobToBase64(audioBlob);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: audioBlob.type || 'audio/webm', // Fallback if type is missing
                data: base64Audio
              }
            },
            {
              text: "Please transcribe this audio accurately. If it is empty or noise, just say so."
            }
          ]
        }
      });

      return response.text || "No transcription available.";
    } catch (error) {
      console.error("Gemini Transcription Error:", error);
      return "Failed to transcribe audio. Please try again.";
    }
  }
};

// Helper to convert Blob to Base64 string (without data URL prefix)
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
