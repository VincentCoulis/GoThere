import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSafeRedirectUrl } from "@/lib/validate-url";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ phrase: string }> }
) {
  const { phrase } = await params;
  const decoded = decodeURIComponent(phrase);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("destinations")
    .select("id, url")
    .ilike("phrase", decoded)
    .eq("is_active", true)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    const searchParams = new URLSearchParams({ q: decoded });
    return NextResponse.redirect(
      new URL(`/?${searchParams.toString()}`, _request.url)
    );
  }

  // Defense-in-depth: block dangerous protocols even if bad data is in the DB
  if (!isSafeRedirectUrl(data.url)) {
    const searchParams = new URLSearchParams({ q: decoded, error: "unsafe" });
    return NextResponse.redirect(
      new URL(`/?${searchParams.toString()}`, _request.url)
    );
  }

  // Increment click count (fire-and-forget)
  supabase.rpc("increment_click_count", { target_id: data.id }).then();

  return NextResponse.redirect(data.url);
}
