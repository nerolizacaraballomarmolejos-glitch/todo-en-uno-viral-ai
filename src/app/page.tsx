"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = ["Rafael Trujillo", "Gasolina RD", "El Chavo del 8", "Messi"];

export default function HomePage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleGenerate() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = (await res.json()) as { jobId?: string; error?: string };
      if (!res.ok || !data.jobId) {
        setError(data.error ?? "Error al generar");
        setLoading(false);
        return;
      }
      router.push(`/dashboard?job=${data.jobId}`);
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
          <span className="text-neon-yellow drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
            TODO EN UNO
          </span>
          <br />
          <span className="text-white">VIRAL AI</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Escribe un nombre y genera un video viral de setenta segundos
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="¿De quién quieres hacer video?"
          className="w-full text-center text-2xl md:text-3xl font-bold bg-zinc-900 border-2 border-zinc-700 focus:border-neon-yellow rounded-2xl px-6 py-6 outline-none transition-colors placeholder:text-zinc-600"
          disabled={loading}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !name.trim()}
          className="mt-6 w-full py-5 rounded-2xl bg-neon-yellow text-zinc-950 font-black text-xl tracking-wide hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(250,204,21,0.3)]"
        >
          {loading ? "GENERANDO..." : "GENERAR TODO"}
        </button>

        {error && <p className="mt-4 text-red-400 text-center text-sm">{error}</p>}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setName(ex)}
              className="px-4 py-2 rounded-full border border-zinc-700 text-zinc-400 text-sm hover:border-neon-yellow hover:text-neon-yellow transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <a
        href="/dashboard"
        className="mt-12 text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
      >
        Ver historial →
      </a>
    </main>
  );
}
