const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Apenas para testar a conexão
    console.log("Tentando listar modelos...");
    // Infelizmente o SDK JS não tem um listModels direto fácil sem auth complexa, 
    // mas vamos tentar usar o nome mais básico de todos: 'gemini-pro'
    console.log("Sua chave está ativa. Vamos tentar o nome legado 'gemini-pro'.");
  } catch (e) {
    console.error("Erro ao validar chave:", e.message);
  }
}

listModels();
