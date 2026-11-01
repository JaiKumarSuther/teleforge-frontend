# TeleForge design system

## Concept

TeleForge looks like a messaging app for running bots. People already know Telegram's layout, so the app borrows its structure:

- a chat-list rail of bots on the left
- conversations in the middle
- an inspector on the right

Bots and their messages are the main content, not cards of numbers.

The one memorable element is the **Live wire**: a single stream of recent messages and replies across all bots, shown as chat bubbles. Everything else stays quiet.

## Colour

The palette is the original Telegram-blue scheme (OKLCH ramps from the logo blue #229ED9 and a cool neutral). Define every colour as a token in `src/app/globals.css`, for both light and dark. Components use the token names, never hex values.

| Token | Light | Dark | Use |
|---|---|---|---|
| paper | #FCFDFE | #0A0D10 | page background |
| panel | #FFFFFF | #0E1216 | panels, inputs, incoming bubbles |
| ink | #131A22 | #EDF0F4 | primary text |
| ink-2 | #5F6975 | #99A0A8 | secondary text (5.4:1 light, 6.8:1 dark on panel) |
| ink-3 | #808A95 | #666E76 | icons and disabled only, never body text |
| line | #E0E5EB | #1F252B | hairline borders, dividers |
| line-strong | #CDD4DB | #2D343C | button and panel edges |
| line-input | #8B949E | #606972 | text-field edges (3:1) |
| rail | #F6F8FB (with a `line` hairline) | #070A0D | left rail |
| relay | #006FA9 | #007CB7 | primary buttons, focus ring (#006FA9 light, #3AA9E0 dark) |
| relay-link | #006FA9 | #83C7F0 | links and accent text |
| live | #1A9951 | #259F56 | running status (text: #1B6C3A / #86DB9D) |
| amber | #E79C27 | #EBA941 | draft status, warnings (text: #8F520D / #F0C374) |
| danger | #C9302D | #C53732 | errors, destructive actions (text: #B02B27 / #F8A59B) |

Derived values, all in `globals.css`:

- **Surfaces:** `well` (#F6F8FB / #0E1216) for bands and table heads, `track` (#F0F3F7 / #12161B) for control tracks and disabled fields, `hover` (#EAEEF3 / #161B21), `pressed` (#E4E9EE / #1A2027).
- **Relay tint:** `relay-tint` (#EAF6FE / #0B2231), `relay-tint-2` (#D6EDFD / #0F2E42), `relay-line` (#96D7FF / #1F5F86).
- **Relay hover:** #006096 light, #006FA9 dark (darker, so white text stays above 4.5:1).
- **Status tints and lines** for live, amber and danger, used by callouts.
- **Button text:** white on relay and on danger in both themes.
- **Brand blue** #229ED9 is for the logo only.

### Rail

- **Light:** the secondary background (`rail` #F6F8FB) with a hairline border. Rows hover to #EAEEF3. The selected row uses the relay tint (#EAF6FE).
- **Dark:** the darkest background (#070A0D). Rows hover to #0E1216. The selected row uses the dark relay tint (#0B2231).
- The rail has its own `rail-ink`, `rail-ink-2`, `rail-line`, `rail-field` and `rail-danger` tokens. All text on it passes 4.5:1 in both themes.

### Bot identity colours

There are 8 hues. Pick one deterministically from a hash of the bot id, and use it for the avatar circle and the bot's tag in feeds.

Every hue gives AA contrast against its white initial (5.16:1 or better). In bubbles, a bot's reply uses a light tint of its hue (light theme) or a deep tint (dark theme), with ink text at AA contrast.

Set (chosen to sit next to the blue): #006FA9, #0F7B6C, #6B4CC9, #B44C1F, #AE3685, #347A34, #8A5A00, #B1303F. The helper is `src/lib/bot-color.ts`.

## Type

- **Schibsted Grotesk Variable** (`@fontsource-variable/schibsted-grotesk`) for everything.
- **Spline Sans Mono** (`@fontsource/spline-sans-mono`) only for bot tokens, @usernames and timestamps.
- Scale (px): 12 caption, 13 label, 14 body-sm, 16 body, 20 title, 28 page heading, 40 display (landing only).
- Weights: 400 body, 500 labels, 600 headings. Use proportional figures.

## Shape and depth

- Radius 6 for inputs and buttons.
- Radius 10 for panels.
- Radius 18 for chat bubbles, with one tight 4px corner on the speaker's side.
- Hairline borders (`line`) in both themes.
- No drop shadows, except a soft shadow on menus, dialogs and the mobile drawer.

## Layout

- **App shell:** left rail 288px (a drawer below 1024px), then the main area with a slim top bar (page title, ⌘K search, actions on the right).
- **Bot pages:** chat list 300px, then the thread, then an inspector 320px (collapsible, hidden below 1280px).
- **Spacing:** multiples of 4 (4, 8, 12, 16, 24, 32, 48).
- Content is left aligned. Grids use `minmax(0, 1fr)` so long names truncate rather than push the page sideways.

## Components

- **Status:** always a dot plus a word (Running, Stopped, Draft, Error), never colour alone.
- **Chat bubbles:**
  - incoming messages on the left (panel colour)
  - bot replies on the right (the bot's identity tint)
  - day separators as centred thin lines with the date
  - system events (started, stopped) as centred thin text
  - errors as centred danger text
- **Buttons:**
  - primary is relay with white text
  - secondary is a panel with a hairline border
  - destructive is danger
  - every button has hover, focus, pressed (scale 0.97), disabled and loading states (spinner, label kept)
- **Empty states:** say what is missing and give the one action that fixes it.

## Rules

- No gradients, glow, glass, blur or decorative blobs.
- No all-caps labels or tracked-out eyebrows above headings.
- No emoji in UI chrome (persona template content may keep them).
- Sentence case everywhere. A button's name says what happens ("Start bot", "Save persona").
- WCAG 2.2 AA in both themes. Visible focus ring on every interactive element. Works from 320px wide.
- Motion only answers an action or shows new data arriving. Use a plain fade when the OS asks for reduced motion. Nothing animates on scroll.
- Typed or streaming text never changes layout: reserve its final size (ghost text in a shared grid cell).