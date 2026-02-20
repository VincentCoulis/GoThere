import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function handleSignOut(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), 303);
}

export const GET = handleSignOut;
export const POST = handleSignOut;
