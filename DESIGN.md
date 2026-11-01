# TeleForge design system

## Concept

TeleForge looks like a messaging app for running bots. People already know Telegram's layout, so the app borrows its structure:

- a chat-list rail of bots on the left
- conversations in the middle
- an inspector on the right

Bots and their messages are the main content, not cards of numbers.

The one memorable element is the **Live wire**: a single stream of recent messages and replies across all bots, shown as chat bubbles. Everything else stays quiet.

## Colour

Define every colour as a token in `src/app/globals.css`, for both light and dark.

| Token | Light | Dark | Use |
|---|---|---|---|
| paper | #F4F6F9 | #0B111B | page background |
| panel | #FFFFFF | #121A27 | panels, inputs, incoming bubbles |
| ink | #121A26 | #E7ECF3 | primary text |
| ink-2 | #4A5566 | #9AA6B8 | secondary text (must pass 4.5:1 on paper and panel) |
| line | #DCE2EA | #243044 | hairline borders, dividers |
| rail | #0E1726 | #080D16 | left rail (dark in both themes) |
| relay | #1D5FD1 | links #4C8DF6, button fill #1D5FD1 | primary buttons and links |
| live | #12A150 | #2FBF6B | running status |
| amber | #B7740A | #E0A23A | stopped, draft, warnings |
| danger | #C93636 | #F06A6A | errors, destructive actions |

### Bot identity colours

There are 8 hues. Pick one deterministically from a hash of the bot id, and use it for the avatar circle and the bot's tag in feeds.

Every hue must give AA contrast against its white initial. In bubbles, a bot's reply uses a light tint of its hue (light theme) or a deep tint (dark theme), with ink text at AA contrast.

Suggested set: #1D5FD1, #0F7B6C, #7A4BD6, #B44C1F, #A3317A, #2F6B2F, #8A5A00, #3C4A9E.

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