# Color Field

Color Field is a community caption studio for New York moments. Members describe a candid scene, Gemini generates a caption, and the community votes to keep or skip it. The app also keeps the original color palette as an inspiration archive.

## Supabase Setup

1. Run [`supabase/setup.sql`](supabase/setup.sql) in the SQL Editor for the existing Supabase project. It creates the profile, caption-generation, and vote tables, enables RLS, and configures the per-user avatar policies. The existing `public.genai` palette table must be present.
2. In Supabase Authentication settings, set the Site URL to your deployed app and allow `http://localhost:3000/auth/callback` plus your deployed app's `/auth/callback` URL. To test Vercel preview deployments, also allow `https://*.vercel.app/auth/callback`.
3. Create a Google OAuth web client in Google Cloud. Add local and deployed app origins as authorized JavaScript origins. Set its authorized redirect URI to the Supabase callback shown in Supabase's Google provider settings (usually `https://<project-ref>.supabase.co/auth/v1/callback`). Enter that client ID and secret in Supabase Authentication > Providers > Google and enable the provider.

The app uses the exact application callback path `/auth/callback` for Google sign-in and email confirmation. Users without first and last names are sent to profile setup after authentication.

Set these values in `.env.local` and Vercel Project Settings:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>
GEMINI_API_KEY=<server-side-Google-AI-Studio-key>
```

`GEMINI_API_KEY` is used only by the authenticated server action and must not use a `NEXT_PUBLIC_` prefix. Caption prompts and generated captions are public; ask users not to include private or identifying details.

RLS allows anyone to read captions, vote totals, and palette colors. Authenticated users can create captions only as themselves, cast one vote per caption only as themselves, read or edit only their own profile, and read only their own vote records. A restricted feed view excludes creator IDs, and vote totals are exposed without voter identities. Caption and vote records cannot be updated or deleted by app clients.

Before submitting, disable Vercel Deployment Protection so the deployment can be checked in a private browser window. Submit the commit-specific deployment URL from Vercel.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
