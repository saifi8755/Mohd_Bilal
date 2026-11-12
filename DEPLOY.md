# GitHub → Vercel: setup guide

This is a **standard Next.js application**, with a real admin at `/admin1101`. It does not use ChatGPT authentication or Cloudflare bindings. Supabase stores content and uploaded files permanently. Vercel hosts the app. You create these accounts and enter your own credentials; no account or paid plan has been created for you.

## 1. Prepare the project

Unzip the download. Upload the **files inside the project folder** to a new GitHub repository (not the ZIP itself). Include `package.json`, `package-lock.json`, `app`, `lib`, `public`, configuration and SQL files. Do not upload `.env.local`, `node_modules`, `.next` or credentials. Node 22+ is required.

Local preview: `npm install`, then `npm run dev`. Visit http://localhost:3000. The portfolio uses bundled content until Supabase is configured.

## 2. Create Supabase storage and the owner account

1. Create your own Supabase project.
2. Open SQL Editor, paste the contents of `supabase-schema.sql`, and run it once. It creates content, revisions, enquiries, secure RPC functions and a **private** `portfolio` file bucket.
3. In Authentication → Users, create the owner account `saifi8755562245@gmail.com` with your chosen password and confirm the email. Disable public signup in Auth settings. Set a strong password through the dashboard; do not put it in source code.
4. From project settings, copy the project URL, legacy `anon` API key and server-only `service_role` API key. The service role bypasses RLS and must never be prefixed with `NEXT_PUBLIC_` or committed to GitHub.

## 3. Import into Vercel

Import the GitHub repo as a Vercel project. Framework: **Next.js**. Root directory: the directory containing `package.json`. Build command: `npm run build`. Use the framework's default output setting.

Set these environment variables:

| Name | Value |
| --- | --- |
| `SITE_URL` | Your exact HTTPS production URL, with no trailing slash |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your project's legacy anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your project's legacy service_role key; server-only |
| `ADMIN_EMAIL` | `saifi8755562245@gmail.com` (create this user in step 2) |

Deploy. If Vercel assigns the URL only after the first deployment, set `SITE_URL` to that URL and redeploy. On a custom domain, update `SITE_URL` and redeploy again. CSRF validation requires the browser URL to match `SITE_URL`; use the canonical URL for admin editing.

For local editing, copy `.env.example` to `.env.local`, populate it and use `SITE_URL=http://localhost:3000`.

## 4. Update your portfolio

Open `/admin1101` → sign in with your Supabase owner account. Sessions expire after one hour; sign in again when needed. No public signup is provided. Recover or change your account credentials through Supabase.

- **CV & resume:** upload separate PDF files or use the same PDF for both. Maximum 3 MB per upload to remain within serverless request limits.
- **Experience:** add a role, company, period and description; move up/down or remove entries.
- **Social links:** add LinkedIn, Instagram, GitHub, Behance or other URLs. Empty links are hidden.
- **Services / Projects:** add, edit, remove and reorder. Use unique lowercase slugs separated by hyphens. Service cards and timelines are generated from your content.
- **Sections:** control ordering and visibility of the 13 built-in sections. Creating a brand-new section layout requires a code change.
- **Design & motion:** update colours, supported fonts and animation setting.
- Save draft → Preview draft → Publish. Version history restores previous publications into the editor. Enquiries appear in the private inbox.

The bucket is private, but files you upload for portfolio use are served by the `/media/` route and should be considered public website assets once their URLs are known. Do not upload confidential documents. This app does not send enquiry emails automatically.

## 5. Verify after configuration

1. Sign in; upload a CV; add an experience and a social link.
2. Save draft. Confirm the public page does not change before Publish.
3. Preview, then Publish. Verify downloads and links from another browser.
4. Try `/api/content` signed out: it should reject access.
5. Submit a real test enquiry and check the inbox. The endpoint limits the site to five accepted enquiries per minute.
6. Check mobile layout and your final domain's SEO metadata.

## Scope of the supplied checks

The code package is type-checked and production-built before delivery. Live Supabase/Vercel authentication, database and file storage require your own configured project and should be verified using the checklist above. No third-party deployment has been performed for you. Existing ChatGPT-hosted database content and uploaded media are not automatically copied into this project; bundled defaults and included images are provided.

Reference documentation:
- https://vercel.com/docs/environment-variables
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/storage

## Exact admin address

Open `https://YOUR-DOMAIN/admin1101` to sign in. After successful authentication, you reach `/admin1101/dashboard`. Signed-out visits to the dashboard return to the login page. The old `/admin` and `/login` addresses redirect to `/admin1101`. This path is not a substitute for authentication; all editing APIs require the verified owner session.

The email is prefilled. A password is NOT embedded in the project. Set it for this email in Supabase Authentication before the first login. The account has not been created in your Supabase project by this download.
