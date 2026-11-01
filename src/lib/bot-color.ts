/**
 * Bot identity colours (DESIGN.md). Each bot gets one of 8 hues, picked from a hash of its id,
 * used for the avatar circle and the bot's tag and replies in feeds.
 *
 * Hues sit around the Telegram blue (#006FA9, the first one): teal, violet, rust, magenta, green, ochre, crimson.
 * Contrast, measured (WCAG 2.x):
 *   white initial on the avatar colour      5.16 to 6.24 across the set (min #0F7B6C at 5.16)
 *   ink #131A22 on the light tint           14.1 to 14.5
 *   ink #EDF0F4 on the dark tint            10.9 to 12.2
 *   avatar against the dark rail #070A0D    3.2 to 3.9 (non-text, 3:1)
 */

const HUES = ["#006FA9", "#0F7B6C", "#6B4CC9", "#B44C1F", "#AE3685", "#347A34", "#8A5A00", "#B1303F"] as const;

const WHITE = "#FFFFFF";
const PANEL_DARK = "#0E1216";

/** Text colours used on top of the tints; they match the ink token in each theme. */
export const BOT_INK = { light: "#131A22", dark: "#EDF0F4" } as const;

function mix(a: string, b: string, t: number): string {
  const ch = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  return (
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(ch(a, i) * t + ch(b, i) * (1 - t))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase()
  );
}

export interface BotColor {
  /** 0 to 7 */
  index: number;
  /** Avatar fill. The initial on it is always white. */
  avatar: string;
  /** White, kept here so callers never hardcode it */
  initial: string;
  /** Bubble fill in the light theme (14% hue on white) */
  tintLight: string;
  /** Bubble fill in the dark theme (38% hue on the dark panel) */
  tintDark: string;
}

const PALETTE: BotColor[] = HUES.map((h, index) => ({
  index,
  avatar: h,
  initial: WHITE,
  tintLight: mix(h, WHITE, 0.14),
  tintDark: mix(h, PANEL_DARK, 0.38),
}));

/** FNV-1a: small, stable across runs, spreads similar ids (Mongo ids share long prefixes) well. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The same id always gives the same colour. */
export function botColor(id: string): BotColor {
  return PALETTE[hash(id) % PALETTE.length];
}

/** Inline CSS variables so a bubble can switch tint with the theme: bg-[var(--bot-tint)]. */
export function botColorVars(id: string): React.CSSProperties {
  const c = botColor(id);
  return {
    "--bot": c.avatar,
    "--bot-tint-light": c.tintLight,
    "--bot-tint-dark": c.tintDark,
  } as React.CSSProperties;
}
