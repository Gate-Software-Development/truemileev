# TrueMile EV — website and dashboard

`index.html` is the public page. `app.html` is the signed-in dashboard. No framework, no bundler, no
CDN, no analytics — same as the legal pages, and the same claim the privacy policy makes.

```
web/truemileev/
  index.html          public page: what the app does, how it works, links
  app.html            the dashboard (noindex)
  assets/config.js    project URL + the public anon key (tools/web-config.py fills it)
  assets/api.js       auth + data. Raw fetch, no SDK
  assets/app.js       rendering
  assets/style.css
```

## 1. The anon key (already done)

`assets/config.js` carries the project's **anon / public** key. It is filled in — run
`python tools/web-config.py` to re-fill it if it is ever cleared or the key is rotated; that script
reads it from `SupabaseClient.kt`, the one place that already has it, so there is nothing to copy by
hand and nothing to mistype.

If you would rather take it from the console: Supabase dashboard → Project Settings → API → Project
API keys → the `anon` `public` row → copy, and paste between the quotes on the `ANON_KEY:` line.

That key is public by design — it is in the APK, and every row it can reach is gated by row-level
security against the signed-in user, not by the key. Rotating it means rebuilding the app too.

**Never put the `service_role` key in this folder.** It ignores row-level security, and everything
here is served to every visitor.

With the key missing the dashboard shows "One value missing" and does nothing else.

## 2. Google sign-in — two consoles, no code

Email and password work as soon as the key is in. Google needs both of these, using the **exact**
origin you publish on:

**Supabase** → Authentication → URL Configuration
- Site URL: `https://truemileev.com` (or whatever the final origin is)
- Redirect URLs: add `https://truemileev.com/app.html`
  (add `http://127.0.0.1:8777/app.html` too if you want to test locally first)

**Google Cloud** → APIs & Services → Credentials → the OAuth client behind `GOOGLE_WEB_CLIENT_ID`
- Authorised JavaScript origins: `https://truemileev.com`
- Authorised redirect URIs: `https://fsnmjxtthahperapdihw.supabase.co/auth/v1/callback`

The last one is Supabase's own callback, not this site's — Google returns to Supabase, Supabase
returns to `app.html`.

## 3. Publishing — it goes live at `gateeng.com/truemileev/`

Nothing in THIS repo is served to anyone. The live pages are separate repos in the
`gate-software-development` GitHub org; gateeng.com is the org site's custom domain, which is why a
project repo named `truemile-privacy` appears at `gateeng.com/truemile-privacy/`. The TrueMile site
follows that pattern exactly:

1. Create a repo named **`truemileev`** in the `gate-software-development` org.
2. Upload the CONTENTS of `web/truemileev/` into it (`index.html`, `app.html`, `assets/`).
3. Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. It is live at `https://gateeng.com/truemileev/` (and at
   `https://gate-software-development.github.io/truemileev/`).

The landing page in `web/site/index.html` already links to `/truemileev/` and `/truemileev/app.html`
from the TrueMile card — upload that too, or make the same two edits on the live copy.

Then the two consoles, using that exact URL:
- Supabase → Authentication → URL Configuration → Redirect URLs: `https://gateeng.com/truemileev/app.html`
- Google Cloud → the OAuth client → Authorised JavaScript origins: `https://gateeng.com`

**About `truemileev.com` later.** A custom domain set on the `truemileev` project repo MOVES it to
that domain — it stops answering at `gateeng.com/truemileev/`. So pick which one is canonical. The
straightforward arrangement: keep this repo canonical at `gateeng.com/truemileev/` until the domain
exists, then either move the domain onto it and leave gateeng.com's card linking out to it, or point
truemileev.com at a redirect. Whichever you choose, both console entries above have to be re-done
with the new origin, and the sign-in breaks until they are.

Two more things worth knowing:

- **The origin is a security boundary, not just branding.** Everything published under gateeng.com
  shares one storage jar, so a sign-in session there is reachable by any other page on that domain.
  Today that is only your own legal pages; a separate `truemileev.com` would isolate it properly.
- **The session lives in `sessionStorage`**, so it dies with the tab. That is deliberate: a token
  that survives a closed tab is a token that survives a shared computer.

## 4. Rules for anything added here later

1. **Read-only.** The tables this page reads carry a `FOR ALL` policy, so a browser *could* write to
   them — and a direct write bypasses the date-ordered cost replay the app and the sync functions
   run, leaving the money wrong on both surfaces with no error. Corrections belong in the app.
2. **Never derive a figure the server already returns.** `get_stats` is net-basis, excludes rebuilt
   drives from every ratio, and rounds the way the app rounds. Recomputing from the columns prints
   numbers 20–45% off on urban drives and starts an argument with the phone.
3. **No polling, no auto-refresh, no background tab.** `get_stats` records an app-open on every
   call, and that counter is what Play reads for the twelve-testers-for-fourteen-days requirement.
   Page load and the Refresh button. Nothing else.
4. **Relabel the internal accounting names.** The prepaid-energy figures arrive under internal key
   names; both render as "Prepaid", told apart by their units, the way the app labels them. No raw
   JSON panel, no generic key→label table, no CSV with real column headers.
5. **Filter `car_status` on every trip query.** Without it the page folds in drives logged in another
   car, and drives still waiting to be identified — which the app promises not to count.
6. **No third-party anything.** No CDN, no remote font, no error-reporting SDK. The promise is
   published in two places and is checkable by anyone who opens the network tab.
7. **Never widen what is disclosed.** Routes, charge locations, home coordinates and the VIN are
   disclosed as *stored*. Behind the user's own session that is fine; a share link, an embed, a
   public URL or a third-party payload turns storage into publication.

## 5. Not here yet

- **Admin metrics.** Everything an operator would want — crash reports, activity, subscriptions —
  has row-level security with no policies, so it is invisible to a browser by design and correctly
  so. It needs one new edge function holding the service role, with an admin allowlist. Not built.
- **Charts.** Charging curves and trends need a self-hosted renderer (inline SVG, most likely) since
  a chart library from a CDN is out.
- **Fleet.** The server has no account-wide aggregate; it was removed deliberately. The app's Fleet
  scope is local-only.
