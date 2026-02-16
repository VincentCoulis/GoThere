import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("destinations")
    .select("phrase, url")
    .eq("is_active", true)
    .eq("status", "active")
    .is("deleted_at", null)
    .ilike("phrase", `%${q}%`)
    .order("click_count", { ascending: false })
    .limit(6);

  if (error) {
    return NextResponse.json([]);
  }

  return NextResponse.json(data);
}
