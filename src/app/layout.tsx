import type { Metadata } from "next";
import "@fontsource/oswald/400.css";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import Providers from "@/components/providers";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Team Brz — Riders. Family. Road.",
  description:
    "Team Brz is a motorcycle club: join tours and meetups, track your medals, and buy or sell bikes and gear with fellow riders.",
};

// @libsql/client's HTTP driver talks to Turso using `fetch()` under the
// hood. Next.js patches the global `fetch` during server rendering and
// caches its responses by default — even for calls a third-party library
// makes internally, not just ones we write ourselves. `dynamic =
// "force-dynamic"` on a page only forces that page to render per-request;
// it does NOT stop an individual fetch() call inside that render from
// being served out of Next's fetch cache. That mismatch is exactly what
// caused the admin panel to show data "one save behind": the render was
// fresh, but the Turso HTTP call inside it was cached. Setting
// fetchCache here, in the root layout, disables fetch caching for every
// route in the app, so every DB read always hits Turso live.
export const fetchCache = "force-no-store";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-body antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
