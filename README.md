# Color Field

Color Field extends the public Supabase color palette with member sign-in, profile completion, avatar uploads, and a server-protected `/members` page.

## Supabase Setup

1. Run [`supabase/setup.sql`](supabase/setup.sql) in the SQL Editor for the existing Supabase project. It creates `public.profiles`, the `auth.users` insert trigger, existing-user profile rows, and the public `avatars` Storage bucket with per-user upload policies. Avatar files are kept in Storage, not the profile table.
2. Keep RLS disabled on `public.profiles` for this assignment, as permitted by the instructions. Do not put a service-role key in the app.
3. In Supabase Authentication settings, set the Site URL to your deployed app and allow `http://localhost:3000/auth/callback` plus your deployed app's `/auth/callback` URL. To test Vercel preview deployments, also allow `https://*.vercel.app/auth/callback`.
4. Create a Google OAuth web client in Google Cloud. Add local and deployed app origins as authorized JavaScript origins. Set its authorized redirect URI to the Supabase callback shown in Supabase's Google provider settings (usually `https://<project-ref>.supabase.co/auth/v1/callback`). Enter that client ID and secret in Supabase Authentication > Providers > Google and enable the provider.

The app uses the exact application callback path `/auth/callback` for Google sign-in and email confirmation. Users without first and last names are sent to profile setup after authentication.

Set these values in `.env.local` and Vercel Project Settings:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>
```

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
