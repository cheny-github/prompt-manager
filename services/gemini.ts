import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    // Check if API key exists. In a real app, we'd handle this more gracefully UI-wise.
    if (!process.env.API_KEY) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function refinePrompt(currentPrompt: string): Promise<string> {
  const ai = getClient();
  
  const systemInstruction = `You are an expert Prompt Engineer. Your task is to refine the user's prompt to be more effective for Large Language Models. 
  - Use clear, direct language.
  - Add structure (Role, Task, Constraints, Output Format).
  - Do not add conversational filler. 
  - Return ONLY the refined prompt text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: currentPrompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || currentPrompt;
  } catch (error) {
    console.error("Gemini refinement failed:", error);
    throw error;
  }
}
