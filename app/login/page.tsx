export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 text-3xl font-bold text-white">Sign in</h1>
      <form className="flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-md bg-cyan-500 px-4 py-2 font-medium text-slate-950"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}