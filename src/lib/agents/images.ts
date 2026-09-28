import type { ImageData } from "./research";

interface PexelsPhoto {
  src: { large: string; medium: string };
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
}

interface WikimediaPage {
  title: string;
  thumbnail?: { source: string };
  originalimage?: { source: string };
}

interface WikimediaResponse {
  query?: { pages?: Record<string, WikimediaPage> };
}

async function pexelsSearch(query: string): Promise<ImageData[]> {
  const key = process.env.PEXELS_KEY;
  if (!key) return [];
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=portrait`;
    const res = await fetch(url, { headers: { Authorization: key } });
    if (!res.ok) return [];
    const data = (await res.json()) as PexelsResponse;
    return (data.photos ?? []).map((p) => ({
      url: p.src.large || p.src.medium,
      fuente: "Pexels",
      descripcion: p.alt || query,
    }));
  } catch {
    return [];
  }
}

async function wikimediaSearch(query: string): Promise<ImageData[]> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&prop=thumbnail|originalimage&piprop=thumbnail&pithumbsize=1080&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as WikimediaResponse;
    const pages = data.query?.pages ?? {};
    return Object.values(pages)
      .filter((p) => p.originalimage?.source || p.thumbnail?.source)
      .map((p) => ({
        url: p.originalimage?.source ?? p.thumbnail?.source ?? "",
        fuente: "Wikimedia Commons",
        descripcion: p.title,
      }));
  } catch {
    return [];
  }
}

async function serpImages(query: string): Promise<ImageData[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=isch&api_key=${key}&num=10&ijn=0`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as { images_results?: { original: string; title: string }[] };
    return (data.images_results ?? []).map((img) => ({
      url: img.original,
      fuente: "SerpAPI Images",
      descripcion: img.title,
    }));
  } catch {
    return [];
  }
}

export async function imagesAgent(name: string): Promise<ImageData[]> {
  const queries = [name, `${name} retrato`, `${name} historia`, `${name} época`];

  const results = await Promise.all([
    ...queries.map((q) => pexelsSearch(q)),
    ...queries.map((q) => wikimediaSearch(q)),
    serpImages(name),
  ]);

  const seen = new Set<string>();
  const unique: ImageData[] = [];
  for (const batch of results) {
    for (const img of batch) {
      if (img.url && !seen.has(img.url)) {
        seen.add(img.url);
        unique.push(img);
      }
    }
  }

  return unique.slice(0, 20);
}
