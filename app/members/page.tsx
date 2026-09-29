import { redirect } from "next/navigation";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.first_name?.trim() || !profile.last_name?.trim()) {
    redirect("/profile?setup=1");
  }

  return (
    <main className="content-page members-page">
      <section className="members-banner">
        <p className="eyebrow">Members / Private room</p>
        <h1>Welcome in, {profile.first_name}.</h1>
        <p>This page is only available to signed-in members with a complete profile.</p>
      </section>
      <section className="member-note">
        <div className="member-avatar">
          {profile.avatar_url ? <Image src={profile.avatar_url} alt="" width={68} height={68} unoptimized /> : <span>{profile.first_name.slice(0, 1)}</span>}
        </div>
        <div>
          <p className="eyebrow">Your member space</p>
          <h2>{profile.first_name} {profile.last_name}</h2>
          <p>Good to have you here. Your profile details are ready whenever you want to update them.</p>
        </div>
      </section>
    </main>
  );
}