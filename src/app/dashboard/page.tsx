"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { VideoJob, JobStatus } from "@/lib/types";

const STATUS_LABEL: Record<JobStatus, string> = {
  pending: "Pendiente",
  researching: "Investigando...",
  scripting: "Escribiendo guion...",
  images: "Buscando imágenes...",
  publishing: "Preparando publicación...",
  done: "Listo",
  error: "Error",
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  const [jobs, setJobs] = useState<VideoJob[] | null>(null);
  const [current, setCurrent] = useState<VideoJob | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/jobs");
        const data = (await res.json()) as { jobs?: VideoJob[]; error?: string };
        if (!active) return;
        if (data.error) setError(data.error);
        setJobs(data.jobs ?? []);
      } catch {
        if (active) setError("No se pudo cargar el historial");
      }
    }
    load();
    const t = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    if (!jobId) return;
    let active = true;
    async function loadJob() {
      try {
        const res = await fetch(`/api/jobs?id=${jobId}`);
        const data = (await res.json()) as { job?: VideoJob };
        if (active && data.job) setCurrent(data.job);
      } catch {
        /* ignore */
      }
    }
    loadJob();
    const t = setInterval(loadJob, 3000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [jobId]);

  return (
    <main className="min-h-screen px-4 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-neon-yellow">DASHBOARD</h1>
        <a href="/" className="text-zinc-400 hover:text-white text-sm">
          ← Nuevo video
        </a>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {current && (
        <section className="mb-10 p-6 rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{current.name}</h2>
            <span
              className={
                current.status === "done"
                  ? "text-green-400"
                  : current.status === "error"
                  ? "text-red-400"
                  : "text-neon-yellow"
              }
            >
              {STATUS_LABEL[current.status]} — {current.progress}%
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 mb-6">
            <div
              className="bg-neon-yellow h-2 rounded-full transition-all"
              style={{ width: `${current.progress}%` }}
            />
          </div>

          {current.research && (
            <div className="mb-4">
              <h3 className="text-sm text-zinc-500 mb-1">INVESTIGACIÓN</h3>
              <p className="text-sm text-zinc-300">
                {current.research.de_pobre_a_rico?.slice(0, 200)}...
              </p>
            </div>
          )}
          {current.script && (
            <div className="mb-4">
              <h3 className="text-sm text-zinc-500 mb-1">GUION</h3>
              <p className="text-sm text-zinc-300 font-medium">{current.script.hook}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {current.script.escenas?.length ?? 0} escenas · CTA: {current.script.cta}
              </p>
            </div>
          )}
          {current.images && current.images.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm text-zinc-500 mb-2">
                IMÁGENES ({current.images.length})
              </h3>
              <div className="flex gap-2 overflow-x-auto">
                {current.images.slice(0, 8).map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img.url}
                    alt={img.descripcion}
                    className="h-24 rounded-lg object-cover flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}
          {current.publication && (
            <div className="mb-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <h3 className="text-sm text-zinc-500 mb-1">PUBLICACIÓN</h3>
              <p className="font-bold text-neon-yellow">{current.publication.titulo}</p>
              <p className="text-sm text-zinc-300 mt-1">{current.publication.descripcion}</p>
              <p className="text-xs text-zinc-500 mt-2">
                {current.publication.hashtags.join(" ")}
              </p>
            </div>
          )}
          {current.video_url && (
            <a
              href={current.video_url}
              download
              className="inline-block mt-2 px-6 py-3 rounded-xl bg-neon-yellow text-zinc-950 font-bold"
            >
              Descargar MP4
            </a>
          )}
          {current.error && <p className="text-red-400 text-sm mt-2">{current.error}</p>}
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold mb-4 text-zinc-400">HISTORIAL</h2>
        {jobs === null ? (
          <p className="text-zinc-600">Cargando...</p>
        ) : jobs.length === 0 ? (
          <p className="text-zinc-600">Aún no hay videos. Genera el primero.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((j) => (
              <a
                key={j.id}
                href={`?job=${j.id}`}
                className="block p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition-colors"
              >
                <div className="flex justify-between">
                  <span className="font-bold">{j.name}</span>
                  <span className="text-sm text-zinc-500">{STATUS_LABEL[j.status]}</span>
                </div>
                <p className="text-xs text-zinc-600 mt-1">
                  {new Date(j.created_at).toLocaleString("es-DO")}
                </p>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-zinc-500">
          Cargando dashboard...
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
