# TeleForge web app

Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS v4, talking to the TeleForge API in `../backend`.

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

The backend must be running. Google sign-in is optional: set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to show the button. In production, set `NEXT_PUBLIC_SITE_URL` (for example `https://teleforge.example.com`) so link previews get an absolute image URL.

## Pages

| Route | What it is |
|---|---|
| `/` | Landing page. Every product image is a capture of this app; the "How it works" pictures are built from the app's own components. |
| `/login`, `/signup` | Email and password (plus Google when configured) |
| `/dashboard` | Overview: today's numbers with a 7-day chart, then every bot with status, today's count, 30-day count and last message |
| `/bots/new` | Token, persona templates, persona, and a test chat that answers with Gemini without touching Telegram |
| `/bots/[id]` | Conversations. Tabs: `/activity` (log), `/persona` (edit and test), `/settings` (rename, Telegram details, delete) |
| `/settings` | Name, password, theme, usage, server status, log out |

Anywhere in the app: `⌘K` / `Ctrl K` (or `/`) opens the command menu: jump to a bot or page, start or stop the current bot, copy its username, switch theme. The theme follows the system by default; Light and Dark are in the account menu.

## Structure

```
src/
├── app/
│   ├── page.tsx                  landing page
│   ├── opengraph-image.png       link preview (also twitter-image.png)
│   ├── (auth)/login, signup
│   ├── (app)/                    signed-in area: guard + app shell
│   │   ├── dashboard/
│   │   ├── bots/new/
│   │   ├── bots/[id]/            layout (header, stats) + page, activity/, persona/, settings/
│   │   └── settings/
│   └── not-found.tsx
├── components/
│   ├── landing/                  header, hero, persona switcher, sections (how it works, showcase, runtime, FAQ)
│   ├── app/                      app shell, command menu, bot list, 7-day bars, chat, conversations, activity log, playground
│   ├── auth/                     auth layout, Google button
│   ├── brand/                    logo, product captures (Shot)
│   └── ui/                       button, field, segmented control, menu, dialog, tooltip, settings card, status, avatars
└── lib/
    ├── api.ts                    typed API client (JWT, time zone header, 401 handling, error shapes)
    ├── auth.tsx                  AuthProvider / useAuth
    ├── hooks.ts                  SWR hooks; running bots refresh every 8 to 10 s
    ├── persona-templates.ts
    ├── use-platform.ts           ⌘ vs Ctrl, command menu event
    └── types.ts
```

Libraries: `swr` (data and polling), `cmdk` (command menu), `next-themes`, `sonner` (toasts), `@phosphor-icons/react`, `@react-oauth/google`, `clsx` + `tailwind-merge`. Fonts are bundled with `@fontsource` (no font CDN): Mona Sans for everything, wide for headings and normal width for text, and Monaspace Neon only for tokens and code.

## Design system

All tokens are in `src/app/globals.css`, defined for light and dark.

- **Colour.** One neutral ramp and one accent. In both themes body text is about 16:1, secondary text 5:1 or better on page and panel backgrounds, placeholders 4.5:1, and text-field edges and the focus ring at least 3:1. Telegram blue (#229ED9) is for the logo only. Buttons use #006FA9 (light) and #007CB7 (dark), both above 4.5:1 with white text; links in dark mode use a lighter #83C7F0.
- **Type.** Ten named sizes, from `caption` (12px) to `display` (fluid, up to 84px). Headings use Mona Sans at 108 to 125% width; numbers use proportional figures (Mona Sans's tabular zero is slashed).
- **Shape.** Radii of 4, 6, 8, 12 and 16px, nested so inner corners sit inside outer ones. In light mode raised things get a 1px ring plus a soft layered shadow; in dark mode a hairline ring replaces the shadow.

## Rules the UI follows

- No gradients, glows, glass or decorative blobs. Status is always a dot plus a word, never colour alone.
- Every control has hover, keyboard focus, pressed (scales to 0.97), disabled (its own neutral style, not a faded copy) and loading (spinner, label kept) states.
- Keyboard: skip link; menus, tabs and segmented controls follow the WAI-ARIA patterns (arrow keys, Home/End, Escape returns focus); dialogs are native `<dialog>` elements; the 7-day chart is one tab stop read with the arrow keys.
- Forms: label above, message below, errors say how to fix them, and the first invalid field gets focus. Submit buttons aren't disabled to hint at missing input; problems show when you submit. (The exception is deleting a bot, which waits until you type its name.) Inputs are 16px on phones so iOS doesn't zoom, and closing or reloading the page with unsaved persona edits asks first.
- Motion answers an action (a menu opening, a dialog rising) and is a plain fade when the OS asks for reduced motion. Nothing animates on scroll.
- Layout holds from 320px up. Responsive grids use `minmax(0, 1fr)` so long names truncate instead of pushing the page sideways.
- "Today" means the viewer's today: the client sends its time zone in `X-Timezone` and the API counts days in it.
- Copy is sentence case with plain verbs, and a button's name matches what happens next ("Stop bot", "Save persona", "Delete bot…").

## Checking it

```bash
npm run lint && npm run typecheck && npm run build   # typecheck generates Next's route types first
```

The UI was also checked with axe-core (WCAG 2.2 A and AA) in light and dark on every page and on open menus and dialogs, a keyboard walk of every page, and an overflow scan at 320, 360, 390, 768, 1024 and 1440px. Nothing was reported at the time of writing; rerun it after big changes.

## Product captures

`public/shots/*.webp` are 2x captures of this app running with demo data, one per theme (`-light` and `-dark`). `src/components/brand/shots.json` holds their pixel sizes, and `<Shot name="…">` shows the right file for the current theme. To replace them, capture the same screens at 2x, save them as WebP with the same names, and update the sizes.
