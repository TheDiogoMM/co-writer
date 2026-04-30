import type { Metadata } from "next";
import { DM_Sans, Lora, Playfair_Display, Alfa_Slab_One, Courier_Prime } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

const alfaSlab = Alfa_Slab_One({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const courier = Courier_Prime({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Co-Writer | Intelligent Narrative Partner",
  description: "AI-powered text editor that adapts to specific author personas and formatting models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${lora.variable} ${playfair.variable} ${alfaSlab.variable} ${courier.variable} h-full antialiased bg-paper`}
      suppressHydrationWarning={true}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a2332" />
        <link rel="icon" href="/logocwicon.png" />
        <link rel="apple-touch-icon" href="/logocwicon.png" />
        <script dangerouslySetInnerHTML={{ __html: `
          if (window.location.hostname === 'localhost' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
              for(let registration of registrations) {
                registration.unregister();
              }
            });
          }
        ` }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
