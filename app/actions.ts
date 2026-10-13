"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = {
  message: string;
  success: boolean;
};

const TONES = {
  witty: "funny and observant",
  wholesome: "warm, kind, and heartfelt",
  deadpan: "dry, understated, and deadpan",
  dramatic: "over-the-top dramatic, like a movie trailer",
} as const;

const GEMINI_MODELS = ["gemini-3.8-flash", "gemini-2.5-flash"];

export type Tone = keyof typeof TONES;

export async function createCaptionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError && authError.name !== "AuthSessionMissingError") {
    console.error("Could not verify session before caption generation:", authError.message);
    return { message: "We couldn't verify your sign-in. Please try again.", success: false };
  }
  if (!user) {
    return { message: "Sign in to create a caption.", success: false };
  }

  const prompt = formData.get("prompt");
  if (typeof prompt !== "string" || prompt.trim().length < 8 || prompt.trim().length > 500) {
    return { message: "Describe your moment in 8 to 500 characters.", success: false };
  }

  const toneInput = formData.get("tone");
  const tone: Tone = typeof toneInput === "string" && toneInput in TONES ? (toneInput as Tone) : "witty";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { message: "AI captions aren't configured yet. Add GEMINI_API_KEY to the server environment.", success: false };
  }

  const requestBody = JSON.stringify({
    systemInstruction: {
      parts: [{
        text: `Write one ${TONES[tone]} social-media caption for a candid photo from New York City. Keep it under 180 characters. Do not add hashtags, quotation marks, explanations, or claim you saw details not in the user's description.`,
      }],
    },
    contents: [{ role: "user", parts: [{ text: prompt.trim() }] }],
    generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
  });

  // Try the primary model, then a fallback, retrying briefly when Gemini is overloaded.
  let response: Response | null = null;
  attempts: for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody, cache: "no-store" },
        );
      } catch (error) {
        console.error("Gemini request failed:", error);
        return { message: "The caption service couldn't be reached. Please try again.", success: false };
      }
      if (response.ok) break attempts;
      const errorBody = await response.text().catch(() => "");
      console.error(`Gemini ${model} returned an unsuccessful response:`, response.status, errorBody.slice(0, 500));
      if (response.status !== 503 && response.status !== 429) break;
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  if (!response?.ok) {
    return { message: "The caption service is busy right now. Please try again in a moment.", success: false };
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch (error) {
    console.error("Gemini returned invalid JSON:", error);
    return { message: "The caption service returned an unreadable response. Please try again.", success: false };
  }

  const caption = getGeneratedCaption(result);
  if (!caption) {
    console.error("Gemini response did not contain a caption.");
    return { message: "The caption service returned no caption. Please try again.", success: false };
  }

  const { error: insertError } = await supabase.from("caption_generations").insert({
    user_id: user.id,
    prompt: prompt.trim(),
    caption,
    tone,
  });
  if (insertError) {
    console.error("Could not save generated caption:", insertError.message);
    return { message: "Your caption was generated but couldn't be saved. Please try again.", success: false };
  }

  revalidatePath("/");
  return { message: "Caption added to the community feed.", success: true };
}

export async function voteCaptionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError && authError.name !== "AuthSessionMissingError") {
    console.error("Could not verify session before caption vote:", authError.message);
    return { message: "We couldn't verify your sign-in. Please try again.", success: false };
  }
  if (!user) {
    return { message: "Sign in to rate captions.", success: false };
  }

  const generationId = formData.get("generationId");
  const value = formData.get("value");
  if (
    typeof generationId !== "string"
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(generationId)
    || (value !== "up" && value !== "down")
  ) {
    return { message: "That vote isn't valid. Please refresh and try again.", success: false };
  }

  const { error: insertError } = await supabase.from("caption_votes").insert({
    generation_id: generationId,
    user_id: user.id,
    value,
  });
  if (insertError) {
    if (insertError.code === "23505") {
      return { message: "You've already rated this caption.", success: false };
    }
    console.error("Could not save caption vote:", insertError.message);
    return { message: "Your vote couldn't be saved. Please try again.", success: false };
  }

  revalidatePath("/");
  return { message: "Vote saved. Thanks for weighing in.", success: true };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

function getGeneratedCaption(result: unknown): string | null {
  if (!result || typeof result !== "object" || !("candidates" in result)) return null;
  const candidates = result.candidates;
  if (!Array.isArray(candidates)) return null;

  const content = candidates[0]?.content;
  if (!content || typeof content !== "object" || !("parts" in content) || !Array.isArray(content.parts)) {
    return null;
  }

  const text = content.parts
    .map((part: unknown) => {
      if (!part || typeof part !== "object" || !("text" in part)) return "";
      return typeof part.text === "string" ? part.text : "";
    })
    .join("")
    .trim();

  return text ? text.slice(0, 280) : null;
}