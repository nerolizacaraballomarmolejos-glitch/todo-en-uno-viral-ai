import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { VideoJob } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  if (id) {
    const { data, error } = await supabaseAdmin
      .from("video_jobs")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Job no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ job: data as VideoJob });
  }

  const { data, error } = await supabaseAdmin
    .from("video_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ jobs: (data ?? []) as VideoJob[] });
}
