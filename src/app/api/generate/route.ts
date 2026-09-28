import { NextRequest, NextResponse } from "next/server";
import { researchAgent } from "@/lib/agents/research";
import { scriptAgent } from "@/lib/agents/script";
import { imagesAgent } from "@/lib/agents/images";
import { publicationAgent } from "@/lib/agents/publication";
import { supabaseAdmin } from "@/lib/supabase";
import type { JobStatus } from "@/lib/types";

export const maxDuration = 300;

async function updateJob(
  id: string,
  status: JobStatus,
  progress: number,
  extra: Record<string, unknown> = {}) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("video_jobs").update({ status, progress, ...extra }).eq("id", id);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: string };
    const name = (body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Escribe un nombre" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase no configurado. Revisa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      );
    }

    const { data: job, error: insertError } = await supabaseAdmin
      .from("video_jobs")
      .insert({ name, status: "researching", progress: 5 })
      .select("id")
      .single();

    if (insertError || !job) {
      return NextResponse.json(
        { error: "No se pudo crear el job: " + (insertError?.message ?? "desconocido") },
        { status: 500 }
      );
    }

    const jobId = job.id as string;

    try {
      await updateJob(jobId, "researching", 10);
      const research = await researchAgent(name);
      await updateJob(jobId, "scripting", 35, { research });

      const script = await scriptAgent(research);
      await updateJob(jobId, "images", 55, { script });

      const images = await imagesAgent(name);
      await updateJob(jobId, "publishing", 75, { images });

      const publication = await publicationAgent(research, script);
      await updateJob(jobId, "done", 100, { publication });

      return NextResponse.json({ ok: true, jobId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      await updateJob(jobId, "error", 0, { error: msg });
      return NextResponse.json({ error: msg, jobId }, { status: 500 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
