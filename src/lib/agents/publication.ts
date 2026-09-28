import OpenAI from "openai";
import type { ResearchData, ScriptData, PublicationData } from "./research";

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY no configurada");
  return new OpenAI({ apiKey: key });
}

export async function publicationAgent(
  research: ResearchData,
  script: ScriptData
): Promise<PublicationData> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Eres un experto en contenido viral de TikTok e Instagram. " +
          "Genera metadata de publicación para el video. " +
          "Devuelve SOLO JSON con: titulo (string, máximo 100 caracteres), " +
          "descripcion (string corta con CTA '¿Cuánto echaste?'), " +
          "hashtags (array de 5 strings virales), portada_texto (string corto para portada 9:16 con estilo neón amarillo). " +
          "El tono debe ser educativo y curioso, nunca glorificar delitos.",
      },
      {
        role: "user",
        content: `Persona: ${research.nombre}\nFrase viral: ${research.frase_viral}\nHook del guion: ${script.hook}\nHashtags del guion: ${script.hashtags.join(", ")}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{} ";
  let parsed: Partial<PublicationData> = {};
  try {
    parsed = JSON.parse(raw) as Partial<PublicationData>;
  } catch {
    parsed = {};
  }

  return {
    titulo: (parsed.titulo ?? `La historia real de ${research.nombre}`).slice(0, 100),
    descripcion:
      parsed.descripcion ??
      `${script.hook} ¿Cuánto echaste? Historia real, sin filtros. Sígueme para más.`.slice(0, 220),
    hashtags:
      Array.isArray(parsed.hashtags) && parsed.hashtags.length >= 5
        ? parsed.hashtags.slice(0, 5)
        : script.hashtags.slice(0, 5),
    portada_texto: parsed.portada_texto ?? research.nombre.toUpperCase(),
  };
}
