import { GoogleGenAI } from "@google/genai";

// Safely retrieve API key, handling environments where 'process' might not be defined
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || '';
const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  // General text generation
  generateText: async (modelId: string, prompt: string, systemInstruction?: string) => {
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  // Image analysis (multimodal)
  analyzeImage: async (prompt: string, base64Image: string) => {
    try {
      // Remove header if present (e.g., "data:image/jpeg;base64,")
      const base64Data = base64Image.split(',')[1] || base64Image;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: 'image/jpeg', // Assuming jpeg/png for simplicity
                        data: base64Data
                    }
                }
            ]
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Image API Error:", error);
      throw error;
    }
  },

  // Structured data analysis simulation (passed as text)
  analyzeData: async (dataContext: string, query: string) => {
    const prompt = `
      Data Context:
      ${dataContext}
      
      Query:
      ${query}
      
      Provide a concise analysis.
    `;
    return GeminiService.generateText('gemini-2.5-flash', prompt);
  },
  
  // Complex reasoning
  generateComplexPlan: async (prompt: string) => {
      return GeminiService.generateText('gemini-3-pro-preview', prompt, "You are an expert logistics planner.");
  }
};