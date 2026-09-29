import LoginForm from "@/app/login/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Color Field / Members</p>
        <h1>A little more personal.</h1>
        <p className="panel-copy">Sign in to keep your profile and color collection together.</p>
        <LoginForm callbackFailed={error === "callback"} />
      </section>
      <aside className="auth-art" aria-label="Color swatches">
        <div className="art-label">A study in color</div>
        <div className="art-swatch art-swatch-one" />
        <div className="art-swatch art-swatch-two" />
        <div className="art-swatch art-swatch-three" />
        <span className="art-caption">Field notes, saved for you.</span>
      </aside>
    </main>
  );
}