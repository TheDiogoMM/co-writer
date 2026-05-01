"use server";

export async function extractPdfText(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "Nenhum arquivo enviado." };

  try {
    const pdf = require("pdf-extraction");
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const data = await pdf(buffer);
    if (!data || !data.text) {
      throw new Error("Nenhum texto extraído do PDF.");
    }
    
    return { text: data.text };
  } catch (error: any) {
    console.error("Erro ao processar PDF:", error);
    return { error: `Erro no servidor: ${error.message || "Falha desconhecida"}` };
  }
}
