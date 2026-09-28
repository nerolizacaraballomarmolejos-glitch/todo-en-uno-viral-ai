import OpenAI from "openai";
import type { ResearchData, ScriptData } from "./research";

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY no configurada");
  return new OpenAI({ apiKey: key });
}

export async function scriptAgent(research: ResearchData): Promise<ScriptData> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Eres un guionista viral de TikTok. Genera un guion de 70 segundos sobre la persona investigada. " +
          "Reglas estrictas: " +
          "1) Hook brutal en los primeros 3 segundos con formato 'De X a Y' (X = origen, Y = destino). " +
          "2) TODOS los números deben escribirse en letras (cero, uno, dos...), nunca dígitos. " +
          "3) Tono educativo, sin glorificar delitos ni violencia. " +
          "4) Devuelve SOLO JSON con: hook (string), duracion_segundos (70), " +
          "escenas (array de objetos con tiempo, texto, imagen_indice), cta (string), hashtags (array de 5 strings). " +
          "El cta debe incluir la frase exacta: ¿Cuánto echaste?",
      },
      {
        role: "user",
        content: `Genera el guion viral con estos datos:\n${JSON.stringify(research, null, 2)}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{} ";
  let parsed: Partial<ScriptData> = {};
  try {
    parsed = JSON.parse(raw) as Partial<ScriptData>;
  } catch {
    parsed = {};
  }

  return {
    hook: parsed.hook ?? `De nada a todo: la historia de ${research.nombre}`,
    duracion_segundos: 70,
    escenas: Array.isArray(parsed.escenas) ? parsed.escenas : [],
    cta: parsed.cta ?? "¿Cuánto echaste? Sígueme para más historias reales.",
    hashtags:
      Array.isArray(parsed.hashtags) && parsed.hashtags.length >= 5
        ? parsed.hashtags.slice(0, 5)
        : ["#historiareal", "#viral", "#curiosidades", "#educativo", "#fyp"],
  };
}
