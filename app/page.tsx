import Link from "next/link";
import CaptionForm from "@/app/components/caption-form";
import CopyButton from "@/app/components/copy-button";
import VoteControls from "@/app/components/vote-controls";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getColorRecords } from "@/lib/supabase";

type CaptionGeneration = {
  id: string;
  prompt: string;
  caption: string;
  created_at: string;
  tone: string;
  up_votes: number;
  down_votes: number;
};

type CaptionVote = {
  generation_id: string;
  value: "up" | "down";
};

const SORTS = [
  { key: "fresh", label: "Fresh" },
  { key: "top", label: "Top rated" },
  { key: "mine", label: "My captions" },
] as const;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortParam } = await searchParams;
  const sort = SORTS.find((item) => item.key === sortParam)?.key ?? "fresh";

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError && authError.name !== "AuthSessionMissingError") {
    throw new Error(`Could not verify the current session: ${authError.message}`);
  }

  let feedQuery = supabase
    .from("caption_feed")
    .select("id, prompt, caption, created_at, tone, up_votes, down_votes")
    .limit(40);
  if (sort === "mine" && user) {
    const { data: mine } = await supabase.from("caption_generations").select("id").eq("user_id", user.id);
    feedQuery = feedQuery.in("id", (mine ?? []).map((row) => row.id));
  }
  feedQuery = sort === "top"
    ? feedQuery.order("up_votes", { ascending: false }).order("created_at", { ascending: false })
    : feedQuery.order("created_at", { ascending: false });

  const [{ data: generations, error: generationsError }, colors] = await Promise.all([
    feedQuery,
    getColorRecords(),
  ]);
  if (generationsError) console.error("Could not load community captions:", generationsError.message);

  const captionItems = (generations ?? []) as CaptionGeneration[];
  const generationIds = captionItems.map((item) => item.id);
  let myVotes: CaptionVote[] = [];
  let voteDataError = Boolean(generationsError);

  if (generationIds.length > 0 && user) {
    const { data: ownVotes, error: ownVotesError } = await supabase
      .from("caption_votes")
      .select("generation_id, value")
      .eq("user_id", user.id)
      .in("generation_id", generationIds);
    if (ownVotesError) {
      console.error("Could not load your caption votes:", ownVotesError.message);
      voteDataError = true;
    } else {
      myVotes = (ownVotes ?? []) as CaptionVote[];
    }
  }

  const myVoteById = new Map(myVotes.map((vote) => [vote.generation_id, vote.value]));

  return (
    <main className="community-page">
      <section className="community-hero">
        <div className="hero-copy">
          <p className="eyebrow">A city full of little stories</p>
          <h1>New York, <em>captioned.</em></h1>
          <p className="hero-description">
            Drop a moment from your day. AI will find the line; the city decides if it lands.
          </p>
          <a className="jump-link" href="#make-a-caption">Make a caption <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="hero-sticker sticker-yellow">Uptown</span>
          <span className="hero-sticker sticker-red">no rush</span>
          <span className="hero-sticker sticker-blue">good light</span>
          <span className="hero-sun" />
          <span className="hero-line hero-line-one" />
          <span className="hero-line hero-line-two" />
          <span className="hero-art-label">40°48′ N<br />73°57′ W</span>
        </div>
      </section>

      <section className="create-section" id="make-a-caption">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your turn / 01</p>
            <h2>What did you notice today?</h2>
          </div>
          <p>Describe a photo or tiny city moment. No photo needed; just give the AI something real to work with.</p>
        </div>
        {user ? (
          <CaptionForm />
        ) : (
          <div className="sign-in-prompt">
            <p>Sign in to generate a caption and vote on the feed.</p>
            <Link className="primary-button" href="/login">Sign in or join</Link>
          </div>
        )}
      </section>

      <section className="feed-section" aria-labelledby="feed-title">
        <div className="section-heading feed-heading">
          <div>
            <p className="eyebrow">The community / 02</p>
            <h2 id="feed-title">Fresh from the sidewalk</h2>
          </div>
          <p>One vote per person, per caption. Keep the line that gets the moment.</p>
        </div>

        <nav className="feed-tabs" aria-label="Sort captions">
          {SORTS.filter((item) => item.key !== "mine" || user).map((item) => (
            <Link
              key={item.key}
              href={item.key === "fresh" ? "/" : `/?sort=${item.key}`}
              className={sort === item.key ? "is-active" : undefined}
              aria-current={sort === item.key ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {generationsError ? (
          <div className="data-notice" role="alert">
            The community feed is unavailable right now. Check that the Supabase setup has been applied, then try again.
          </div>
        ) : null}
        {voteDataError && !generationsError ? (
          <div className="data-notice" role="alert">
            Vote details are unavailable right now. Please refresh before rating a caption.
          </div>
        ) : null}

        {captionItems.length === 0 && !generationsError ? (
          <div className="empty-state">
            {sort === "mine"
              ? "You haven't made a caption yet. Describe a moment above to get started."
              : "No captions yet. Start the feed with a small detail from your day in the city."}
          </div>
        ) : captionItems.length > 0 ? (
          <div className="caption-grid">
            {captionItems.map((item, index) => {
              return (
                <article className="caption-card" key={item.id}>
                  <div className={`caption-art caption-tone-${index % 4}`} aria-hidden="true">
                    <span>FIELD NOTE&nbsp; / &nbsp;{String(index + 1).padStart(2, "0")}</span>
                    <span className="caption-mark">“</span>
                  </div>
                  <div className="caption-card-body">
                    <p className="caption-prompt"><span>THE SCENE · {item.tone.toUpperCase()}</span>{item.prompt}</p>
                    <blockquote>{item.caption}</blockquote>
                    <div className="caption-card-footer">
                      <CopyButton text={item.caption} />
                      <time dateTime={item.created_at}>
                        {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </time>
                      <VoteControls
                        generationId={item.id}
                        isSignedIn={Boolean(user)}
                        isAvailable={!voteDataError}
                        userVote={myVoteById.get(item.id)}
                        upVotes={item.up_votes}
                        downVotes={item.down_votes}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      {colors.length > 0 ? (
        <section className="palette-archive" aria-labelledby="palette-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">From the archive / 03</p>
              <h2 id="palette-title">Colors around town</h2>
            </div>
            <p>A little color inspiration from the original Color Field collection.</p>
          </div>
          <div className="color-grid">
            {colors.map((item) => (
              <article key={item.id} className="color-tile">
                <div className="color-chip" style={{ backgroundColor: item.hex || "#d8d5ca" }} />
                <div className="color-details">
                  <div className="color-name-row">
                    <h2>{item.name}</h2>
                    <span>#{item.id}</span>
                  </div>
                  <p className="color-family">{item.family || "Unclassified"}</p>
                  <div className="color-meta">
                    <span>{item.hex || "No hex value"}</span>
                    {item.created_at ? <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString()}</time> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
