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
        <p className="eyebrow">Join the conversation</p>
        <h1>Good moments deserve good captions.</h1>
        <p className="panel-copy">Sign in to make your own city caption and rate the ones that get New York right.</p>
        <LoginForm callbackFailed={error === "callback"} />
      </section>
      <aside className="auth-art" aria-label="A colorful abstract collage">
        <span className="art-label">New York, in color</span>
        <span className="art-swatch art-swatch-one" />
        <span className="art-swatch art-swatch-two" />
        <span className="art-swatch art-swatch-three" />
        <span className="art-caption">One city. A million ways to see it.</span>
      </aside>
    </main>
  );
}