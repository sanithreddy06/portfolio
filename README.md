# saisanith.in — Portfolio

Personal portfolio of **Sai Sanith Reddy**. Plain HTML, CSS and JavaScript, with no build step.

```
index.html              page structure and content
api/contact.js          serverless function that emails form messages (Resend)
styles.css              all styling (dark lab + acid-lime theme)
script.js               projects/hackathons data, Live Lab, contact form
assets/Resume_Sanith.pdf
```

## Run locally (with a working contact form)

Needs Node.js 18+ (`node -v` to check, install from https://nodejs.org).

```bash
cd ~/Documents/Projects/"Latest Portfoilio"
cp .env.example .env.local      # then open .env.local and paste your real RESEND_API_KEY
npm run dev                     # open http://localhost:3000
```

`dev-server.js` serves the site and runs `api/contact.js` exactly like Vercel does, so messages
from the form arrive in your Gmail via Resend. `.env.local` is git-ignored, so your key is never pushed.

> `python3 -m http.server` or double-clicking `index.html` will show the site, but the form can't
> send from there (there's no server to hold the API key).

## Contact form (Resend)

The form posts to `/api/contact` (`api/contact.js`), a Vercel serverless function that emails the
visitor's name, email and message to **mudiyalasanith2006@gmail.com** using Resend.
"Reply" in Gmail goes straight to the visitor.

1. Use the same Resend API key as the old portfolio (Resend → **API Keys**), or create a new one there.
2. In Vercel: Project → **Settings → Environment Variables** → add `RESEND_API_KEY` = your key, then **Redeploy**.
3. Send a test message from the live site.

> Never put the key in `script.js` or commit it. `.env*` files are git-ignored.

**Sender address:** emails are sent from `contact@saisanithreddy.online`, the domain already verified in
your Resend account (same as the old Next.js portfolio). To use another verified domain, set `CONTACT_FROM`
in Vercel, e.g. `Portfolio <contact@saisanith.in>` after verifying `saisanith.in` in Resend → Domains.

### Spam protection (built into `api/contact.js`)

| Guard | What it stops |
|---|---|
| Hidden "honeypot" field | Bots that fill in every field. They get a fake "success" and nothing is sent. |
| Time check (under 3 s = bot) | Scripts that submit instantly |
| Validation and limits | Name 2–100 chars, valid email, message 10–2000 chars, max 3 links |
| Rate limits | **3 messages / 10 min** and **8 / day** per visitor, **5 / day** per email address, **60 / day** total |
| Duplicate guard | The same message sent twice within a day is delivered once |
| Origin check | Other websites posting to your API |
| Browser cooldown | 60 s between sends and 3 / hour, shown as a friendly message |

Visitor IPs are hashed and never stored in readable form. Change the numbers in the `LIMITS` block at the top of `api/contact.js`.

**Make the rate limits bulletproof (free, recommended):** Vercel can run several copies of the
function at once, and each copy keeps its own in-memory count. To share one count across all of them:
1. Sign up at https://upstash.com → **Create Database** (Redis, free plan, region close to you, e.g. Mumbai).
2. On the database page, copy **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**.
3. Add both in Vercel → Settings → Environment Variables, then redeploy.

## Edit content

- **Projects / hackathons:** edit the `PROJECTS` and `HACKATHONS` arrays at the top of `script.js`.
- **Resume:** replace `assets/Resume_Sanith.pdf` and keep the same file name.

## Push to GitHub

```bash
cd "~/Documents/Projects/Latest Portfoilio"
git init
git add .
git commit -m "New portfolio"
git branch -M main
git remote add origin https://github.com/sanithreddy06/portfolio.git
git push -u origin main
```

(Create the empty `portfolio` repo on GitHub first: github.com → **New repository**. Leave out the README.)

## Deploy to saisanith.in

**Vercel** (required for the contact form's `/api/contact` function):
Vercel → **Add New → Project** → import the `portfolio` repo → Framework preset **Other** → Deploy.
Then open Project → **Settings → Domains** → add `saisanith.in` and `www.saisanith.in` (and remove them from the old project).

**GitHub Pages** (alternative: static only, so the contact form falls back to opening the visitor's email app):
Repo → **Settings → Pages** → Source **Deploy from a branch** → `main` / root → Save.
Add the custom domain `saisanith.in` there, then point your DNS at GitHub Pages as GitHub shows you.
