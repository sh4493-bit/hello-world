"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type ProfileEditorProps = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  setup: boolean;
};

export default function ProfileEditor({
  userId,
  email,
  firstName: initialFirstName,
  lastName: initialLastName,
  avatarUrl: initialAvatarUrl,
  setup,
}: ProfileEditorProps) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialAvatarUrl);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Choose an image smaller than 5 MB.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage("");
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    let savedAvatarUrl = avatarUrl;
    if (selectedFile) {
      const extension = selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, selectedFile, {
        cacheControl: "3600",
        contentType: selectedFile.type,
        upsert: false,
      });
      if (uploadError) {
        setMessage(uploadError.message);
        setBusy(false);
        return;
      }
      savedAvatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      avatar_url: savedAvatarUrl || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(error.message);
    } else {
      setAvatarUrl(savedAvatarUrl);
      setSelectedFile(null);
      setMessage("Profile saved.");
      router.refresh();
      if (setup && firstName.trim() && lastName.trim()) router.push("/members");
    }
    setBusy(false);
  }

  return (
    <form className="profile-form" onSubmit={saveProfile}>
      <div className="profile-photo-row">
        <div className="avatar-frame">
          {previewUrl ? <Image src={previewUrl} alt="Profile" width={84} height={84} unoptimized /> : <span>{firstName.slice(0, 1) || "+"}</span>}
        </div>
        <div>
          <p className="field-title">Profile photo</p>
          <button className="text-button" type="button" onClick={() => fileInput.current?.click()}>
            {previewUrl ? "Choose a new photo" : "Upload a photo"}
          </button>
          <input ref={fileInput} className="visually-hidden" type="file" accept="image/*" onChange={choosePhoto} />
          <p className="field-hint">Image files up to 5 MB</p>
        </div>
      </div>

      <div className="form-grid">
        <label>
          First name
          <input autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required={setup} />
        </label>
        <label>
          Last name
          <input autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} required={setup} />
        </label>
      </div>
      <label>
        Email address
        <input type="email" value={email} readOnly />
      </label>
      <div className="profile-form-footer">
        <p className="form-message" aria-live="polite">{message}</p>
        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}