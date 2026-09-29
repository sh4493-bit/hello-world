import { redirect } from "next/navigation";
import ProfileEditor from "@/app/profile/profile-editor";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const { setup } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="content-page">
      <section className="page-heading">
        <p className="eyebrow">Your account</p>
        <h1>{setup === "1" ? "Let’s make it yours." : "Profile"}</h1>
        <p>{setup === "1" ? "Add your name to finish setting up your profile." : "Keep your details up to date."}</p>
      </section>
      <ProfileEditor
        userId={user.id}
        email={user.email ?? ""}
        firstName={profile?.first_name ?? ""}
        lastName={profile?.last_name ?? ""}
        avatarUrl={profile?.avatar_url ?? ""}
        setup={setup === "1"}
      />
    </main>
  );
}