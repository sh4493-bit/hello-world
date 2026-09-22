import { getDemoItems } from "@/lib/supabase";

export default async function Home() {
  const items = await getDemoItems();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-cyan-400">
          Supabase data
        </p>
        <h1 className="mb-6 text-4xl font-bold">Hello World Dashboard</h1>

        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-300">
            No rows found yet. Add data to the demo_items table in Supabase.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg shadow-slate-950/40"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">{item.name}</h2>
                  <span className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-xs font-medium text-cyan-300">
                    #{item.id}
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  {item.description || "No description provided."}
                </p>
                {item.created_at ? (
                  <p className="mt-4 text-xs text-slate-500">
                    Created {new Date(item.created_at).toLocaleDateString()}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}