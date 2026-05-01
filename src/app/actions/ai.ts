"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = (process.env.GEMINI_API_KEY || "").trim();
const groqApiKey = (process.env.GROQ_API_KEY || "").trim();

const GEMINI_MODELS = [
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro-latest",
  "gemini-pro",
];

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
];

export async function generateContent(
  prompt: string, 
  persona: string, 
  context: string, 
  trainingData: string = "",
  mode: "creative" | "analyze" | "convert" = "creative"
) {
  console.log(`[AI] Iniciando geração. Modo: ${mode}, Persona: ${persona}`);
  let lastError = "";

  // 1. GEMINI
  if (geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      for (const modelName of GEMINI_MODELS) {
        try {
          console.log(`[Gemini] Tentando: ${modelName}`);
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: { temperature: mode === "creative" ? 0.9 : 0.4 },
          });

          if (!model) throw new Error("Falha ao instanciar modelo Gemini");

          const fullPrompt = buildPrompt(prompt, persona, context, trainingData, mode);
          const result = await model.generateContent(fullPrompt);
          if (!result) throw new Error("Resultado da IA vazio");
          
          const response = await result.response;
          if (!response) throw new Error("Resposta da IA vazia");
          
          const text = response.text();
          if (text) {
             console.log(`[Gemini] Sucesso com ${modelName}`);
             return { text };
          }
        } catch (error: any) {
          console.error(`[Gemini] Falha no ${modelName}:`, error.message);
          lastError = `Gemini(${modelName}): ${error.message}`;
        }
      }
    } catch (e: any) {
      console.error("[Gemini] Erro crítico na inicialização:", e.message);
      lastError = `Gemini Init: ${e.message}`;
    }
  }

  // 2. GROQ
  if (groqApiKey) {
    for (const modelName of GROQ_MODELS) {
      try {
        console.log(`[Groq] Tentando: ${modelName}`);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: `Você é um co-escritor criativo especializado no estilo de ${persona}. 
              
INSTRUÇÕES DE PERSONA: ${trainingData.substring(0, 5000)}

DIRETRIZ: Sua prioridade é continuar o fluxo da história do usuário mantendo este estilo. Nunca ignore o contexto fornecido pelo usuário.` },
              { role: "user", content: buildPrompt(prompt, persona, context, "", mode) }
            ],
            temperature: mode === "creative" ? 0.9 : 0.4,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `Erro HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          console.log(`[Groq] Sucesso com ${modelName}`);
          return { text: data.choices[0].message.content };
        }
      } catch (error: any) {
        console.error(`[Groq] Falha no ${modelName}:`, error.message);
        lastError = `Groq(${modelName}): ${error.message}`;
      }
    }
  }

  return { error: `IA indisponível. Último erro: ${lastError}` };
}

function buildPrompt(prompt: string, persona: string, context: string, trainingData: string, mode: string) {
  const contextClean = context.trim();
  if (mode === "convert") {
    return `Você é ${persona}. Transforme o texto abaixo no formato: ${prompt}. Mantenha o estilo e a voz da persona.
    
TEXTO ORIGINAL:
${contextClean}`;
  } else if (mode === "creative") {
    return `Você é ${persona}. 
${trainingData ? `INSTRUÇÕES DE ESTILO E VOZ: ${trainingData}` : ""}

SUA TAREFA: ${prompt}

CONTEXTO OBRIGATÓRIO (O texto abaixo é o que o usuário já escreveu. Você deve continuar EXATAMENTE de onde ele parou ou melhorar EXATAMENTE o trecho enviado. NÃO mude a história, os personagens ou o cenário a menos que solicitado):
--- INÍCIO DO CONTEXTO ---
${contextClean}
--- FIM DO CONTEXTO ---

INSTRUÇÃO CRÍTICA: Não invente novos nomes ou situações que contradigam o contexto acima. Responda APENAS com o texto literário. Sem comentários.`;
  } else if (mode === "analyze" && prompt.toLowerCase().includes("entidades")) {
    return `Analise o texto abaixo e identifique PERSONAGENS e CENÁRIOS. 
Retorne uma lista formatada como: NOME (CATEGORIA).

TEXTO:
${contextClean}`;
  } else {
    return `Analise o seguinte pedido: ${prompt}. 
    
TEXTO DE BASE:
${contextClean}`;
  }
}
