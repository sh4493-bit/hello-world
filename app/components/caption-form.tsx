"use client";

import { useActionState } from "react";
import { createCaptionAction, type ActionState } from "@/app/actions";

const initialState: ActionState = { message: "", success: false };

export default function CaptionForm() {
  const [state, formAction, pending] = useActionState(createCaptionAction, initialState);

  return (
    <form className="caption-form" action={formAction}>
      <label htmlFor="caption-prompt">Your moment</label>
      <textarea
        id="caption-prompt"
        name="prompt"
        minLength={8}
        maxLength={500}
        placeholder="The 1 train stopped between stations and everyone started rating each other's tote bags..."
        required
      />
      <div className="caption-form-footer">
        <span>Keep it under 500 characters. Please skip private or identifying details.</span>
        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? "Finding the line…" : "Generate caption"}
        </button>
      </div>
      <p className={`action-message${state.success ? " action-success" : ""}`} aria-live="polite">
        {state.message}
      </p>
    </form>
  );
}
