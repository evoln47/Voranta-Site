/**
 * Voranta — Next.js font loading
 * Place at: lib/fonts.ts
 * Apply the variables to <html> in app/layout.tsx
 *
 * Roles:
 *   --font-sans     Geist        — dominant voice. Body, headings, UI.
 *   --font-display  Fraunces     — trust moments only: wordmark, framework
 *                                  name, research callouts. Never headings.
 *   --font-mono     Geist Mono   — eyebrows, badges, data labels, tags.
 */
import { Fraunces, Geist, Geist_Mono } from "next/font/google";

export const fontDisplay = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-display",
  display: "swap",
});

export const fontSans = Geist({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-mono",
  display: "swap",
});

/**
 * Apply in app/layout.tsx:
 *
 * import { fontDisplay, fontSans, fontMono } from "@/lib/fonts";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en" className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 *
 * Then remove the @import url(...) line from globals.css since next/font handles it.
 */
