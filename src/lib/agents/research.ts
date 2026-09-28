import OpenAI from "openai";

export interface ResearchData {
  nombre: string;
  fecha_nacimiento: string;
  fecha_muerte: string;
  de_pobre_a_rico: string;
  como_se_hizo_poderoso: string;
  polemicas: string[];
  como_murio_o_cayo: string;
  fortuna_estimada: string;
  frase_viral: string;
  datos_ocultos: string[];
  fuentes: string[];
}

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY no configurada");
  return new OpenAI({ apiKey: key });
}

async function serpSearch(query: string): Promise<string> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return "";
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${key}&num=5&hl=es`;
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = (await res.json()) as { organic_results?: { title: string; snippet: string }[] };
    return (data.organic_results ?? []).map((r) => `${r.title}: ${r.snippet}`).join("\n");
  } catch {
    return "";
  }
}

async function wikipediaSummary(name: string): Promise<string> {
  try {
    const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = (await res.json()) as { extract?: string };
    return data.extract ?? "";
  } catch {
    return "";
  }
}

export async function researchAgent(name: string): Promise<ResearchData> {
  const [serp, wiki] = await Promise.all([serpSearch(name), wikipediaSummary(name)]);

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Eres un investigador histórico. Investiga a fondo a la persona o tema indicado. " +
          "Devuelve SOLO un JSON válido con estas claves exactas: " +
          "nombre, fecha_nacimiento, fecha_muerte, de_pobre_a_rico, como_se_hizo_poderoso, " +
          "polemicas (array de 3 strings), como_murio_o_cayo, fortuna_estimada, " +
          "frase_viral, datos_ocultos (array de 5 strings), fuentes (array de strings). " +
          "Todo verificado con Wikipedia y noticias. Si no sabes algo, escribe 'No verificado'. " +
          "Nunca glorifiques delitos; describe hechos con tono educativo.",
      },
      {
        role: "user",
        content: `Investiga a fondo a: ${name}\n\nContexto de Wikipedia:\n${wiki}\n\nContexto de noticias:\n${serp}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{} ";
  let parsed: Partial<ResearchData> = {};
  try {
    parsed = JSON.parse(raw) as Partial<ResearchData>;
  } catch {
    parsed = {};
  }

  return {
    nombre: parsed.nombre ?? name,
    fecha_nacimiento: parsed.fecha_nacimiento ?? "No verificado",
    fecha_muerte: parsed.fecha_muerte ?? "No verificado",
    de_pobre_a_rico: parsed.de_pobre_a_rico ?? "No verificado",
    como_se_hizo_poderoso: parsed.como_se_hizo_poderoso ?? "No verificado",
    polemicas: Array.isArray(parsed.polemicas) ? parsed.polemicas.slice(0, 3) : [],
    como_murio_o_cayo: parsed.como_murio_o_cayo ?? "No verificado",
    fortuna_estimada: parsed.fortuna_estimada ?? "No verificado",
    frase_viral: parsed.frase_viral ?? "",
    datos_ocultos: Array.isArray(parsed.datos_ocultos) ? parsed.datos_ocultos.slice(0, 5) : [],
    fuentes: Array.isArray(parsed.fuentes) ? parsed.fuentes : [],
  };
}
