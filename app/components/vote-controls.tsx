"use client";

import Link from "next/link";
import { useActionState } from "react";
import { voteCaptionAction, type ActionState } from "@/app/actions";

const initialState: ActionState = { message: "", success: false };

type VoteControlsProps = {
  generationId: string;
  isSignedIn: boolean;
  isAvailable: boolean;
  userVote?: "up" | "down";
  upVotes: number;
  downVotes: number;
};

export default function VoteControls({
  generationId,
  isSignedIn,
  isAvailable,
  userVote,
  upVotes,
  downVotes,
}: VoteControlsProps) {
  const [state, formAction, pending] = useActionState(voteCaptionAction, initialState);

  if (!isAvailable) {
    return <div className="vote-guest">Vote details unavailable</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="vote-guest">
        <span>{upVotes} keep · {downVotes} skip</span>
        <Link href="/login">Sign in to rate</Link>
      </div>
    );
  }

  return (
    <div className="vote-wrap">
      <form className="vote-actions" action={formAction}>
        <input type="hidden" name="generationId" value={generationId} />
        <button
          className={`vote-button${userVote === "up" ? " is-selected" : ""}`}
          type="submit"
          name="value"
          value="up"
          disabled={Boolean(userVote) || pending}
          aria-label={`Keep this caption, ${upVotes} votes`}
        >
          <span aria-hidden="true">↑</span> Keep <b>{upVotes}</b>
        </button>
        <button
          className={`vote-button${userVote === "down" ? " is-selected" : ""}`}
          type="submit"
          name="value"
          value="down"
          disabled={Boolean(userVote) || pending}
          aria-label={`Skip this caption, ${downVotes} votes`}
        >
          <span aria-hidden="true">↓</span> Skip <b>{downVotes}</b>
        </button>
      </form>
      <p className="action-message vote-message" aria-live="polite">
        {userVote ? `Your vote: ${userVote === "up" ? "keep" : "skip"}.` : state.message}
      </p>
    </div>
  );
}
