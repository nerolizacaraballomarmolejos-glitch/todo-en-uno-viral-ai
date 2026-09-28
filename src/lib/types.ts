export type JobStatus = "pending" | "researching" | "scripting" | "images" | "publishing" | "done" | "error";

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

export interface ScriptData {
  hook: string;
  duracion_segundos: number;
  escenas: { tiempo: string; texto: string; imagen_indice: number }[];
  cta: string;
  hashtags: string[];
}

export interface ImageData {
  url: string;
  fuente: string;
  descripcion: string;
}

export interface PublicationData {
  titulo: string;
  descripcion: string;
  hashtags: string[];
  portada_texto: string;
}

export interface VideoJob {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  status: JobStatus;
  progress: number;
  research: ResearchData | null;
  script: ScriptData | null;
  images: ImageData[] | null;
  publication: PublicationData | null;
  video_url: string | null;
  error: string | null;
}
