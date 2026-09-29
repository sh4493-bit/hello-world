import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const supabase = await createSupabaseServerClient();

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=callback", url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=callback", url.origin));
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=callback", url.origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const needsProfile = !profile?.first_name?.trim() || !profile?.last_name?.trim();
  return NextResponse.redirect(
    new URL(needsProfile ? "/profile?setup=1" : "/members", url.origin),
  );
}