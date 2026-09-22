import { getColorRecords } from "@/lib/supabase";

export default async function Home() {
  const items = await getColorRecords();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-cyan-400">
          Supabase data
        </p>
        <h1 className="mb-6 text-4xl font-bold">Color Palette</h1>

        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-300">
            No data available in the genai table yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-lg shadow-slate-950/40"
              >
                <div
                  className="h-24 w-full border-b border-slate-700"
                  style={{ backgroundColor: item.hex || "#1e293b" }}
                />

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-white">{item.name}</h2>
                    <span className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-xs font-medium text-cyan-300">
                      #{item.id}
                    </span>
                  </div>

                  <p className="mb-3 text-sm text-slate-300">
                    Family: <span className="font-medium text-white">{item.family || "Unknown"}</span>
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200">
                      {item.hex || "No hex value"}
                    </span>
                    {item.created_at ? (
                      <span className="text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}