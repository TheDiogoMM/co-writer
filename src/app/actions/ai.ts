"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Limpeza da chave para evitar espaços em branco
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateContent(
  prompt: string, 
  persona: string, 
  context: string, 
  trainingData: string = "",
  mode: "creative" | "analyze" | "convert" = "creative"
) {
  if (!apiKey) {
    return { error: "GEMINI_API_KEY não encontrada no .env.local" };
  }

  try {
    // Tentando o modelo padrão estável
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: mode === "creative" ? 0.9 : 0.4,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ]
    });

    let fullPrompt = "";

    if (mode === "convert") {
      fullPrompt = `Transforme o texto abaixo no formato: ${prompt}. Estilo: ${persona}. Texto: ${context}`;
    } else if (mode === "creative") {
      fullPrompt = `Persona: ${persona}. Treinamento: ${trainingData}. Tarefa: ${prompt}. Contexto: ${context}`;
    } else {
      fullPrompt = `Analise: ${prompt}. Texto: ${context}`;
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return { text: response.text() };
  } catch (error: any) {
    console.error("Erro detalhado no Gemini:", error);
    // Se o erro for 404, pode ser que o modelo exato mude por região
    return { error: error.message || "Erro de conexão com a IA" };
  }
}
