import type { Metadata, Viewport } from "next";
import "@fontsource-variable/schibsted-grotesk/wght.css";
import "@fontsource/spline-sans-mono/400.css";
import "@fontsource/spline-sans-mono/500.css";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  // Absolute base for the social preview image (app/opengraph-image.png). Set NEXT_PUBLIC_SITE_URL in production.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "TeleForge | Telegram bots with a persona you write",
    template: "%s | TeleForge",
  },
  description:
    "Paste a BotFather token, describe how your bot should talk, and TeleForge answers every Telegram message with Google Gemini. Tokens are encrypted and every conversation is logged.",
  applicationName: "TeleForge",
  openGraph: {
    title: "TeleForge",
    description: "Give /newbot a personality. Telegram bots that answer in the voice you write.",
    type: "website",
    siteName: "TeleForge",
  },
  twitter: { card: "summary_large_image", title: "TeleForge", description: "Give /newbot a personality. Telegram bots that answer in the voice you write." },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfdfe" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d10" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
