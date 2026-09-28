# TODO EN UNO VIRAL AI

Genera videos virales de 70 segundos sobre cualquier persona o tema con un solo botón.

## Stack
- Next.js 14 + Tailwind (dark neon)
- Supabase (historial de videos)
- OpenAI GPT-4o (research + guion)
- SerpAPI (búsqueda web + imágenes)
- Pexels / Wikimedia / Pixabay (imágenes reales)
- ElevenLabs (voz) — stub
- Remotion + FFmpeg (video) — stub

## Setup
1. `npm install`
2. Copia `.env.example` a `.env.local` y pega tus keys
3. En Supabase ejecuta `supabase/schema.sql`
4. `npm run dev`

## Deploy en Vercel
Añade las variables de entorno en Vercel → Settings → Environment Variables y redeploy.

## Estado
- ✅ Research Agent (GPT-4o + SerpAPI + Wikipedia)
- ✅ Guion Viral Agent (70s, hook brutal, números en letras)
- ✅ Images Agent (Pexels + Wikimedia + SerpAPI)
- ✅ Publication Agent (título, descripción, hashtags, portada)
- ⏳ Video Editor Agent (Remotion + ElevenLabs + FFmpeg)
- ⏳ Publicación real TikTok/IG/YouTube
