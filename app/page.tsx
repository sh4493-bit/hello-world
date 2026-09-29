import { getColorRecords } from "@/lib/supabase";

export default async function Home() {
  const items = await getColorRecords();

  return (
    <main className="palette-page">
      <div className="palette-intro">
        <div>
          <p className="eyebrow">Collected colors / 01</p>
          <h1>Color, in good company.</h1>
        </div>
        <p>A small collection of hues, gathered from the Supabase palette table.</p>
      </div>

      <div className="palette-content">
        {items.length === 0 ? (
          <div className="empty-state">No colors are in the genai table yet.</div>
        ) : (
          <div className="color-grid">
            {items.map((item) => (
              <article key={item.id} className="color-tile">
                <div
                  className="color-chip"
                  style={{ backgroundColor: item.hex || "#d8d5ca" }}
                />
                <div className="color-details">
                  <div className="color-name-row">
                    <h2>{item.name}</h2>
                    <span>#{item.id}</span>
                  </div>
                  <p className="color-family">{item.family || "Unclassified"}</p>
                  <div className="color-meta">
                    <span>{item.hex || "No hex value"}</span>
                    {item.created_at ? (
                      <time dateTime={item.created_at}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </time>
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