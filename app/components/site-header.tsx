import Link from "next/link";
import { signOutAction } from "@/app/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="site-header">
      <Link className="brand-mark" href="/" aria-label="Color Field home">
        <span className="brand-swatch" aria-hidden="true" />
        <span>Color Field</span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/">Caption feed</Link>
        {user ? (
          <>
            <Link href="/members">Members</Link>
            <Link href="/profile">Profile</Link>
            <form action={signOutAction}>
              <button className="nav-button" type="submit">Sign out</button>
            </form>
          </>
        ) : (
          <Link className="nav-cta" href="/login">Sign in</Link>
        )}
      </nav>
    </header>
  );
}