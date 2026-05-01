import { DM_Sans, Lora, Playfair_Display, Alfa_Slab_One, Courier_Prime, Caveat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// ... (dentro dos carregamentos de fonte)
const caveat = Caveat({
  variable: "--font-handwriting",
  subsets: ["latin"],
});

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
      className={`${dmSans.variable} ${lora.variable} ${playfair.variable} ${alfaSlab.variable} ${courier.variable} ${caveat.variable} h-full antialiased bg-paper`}
      suppressHydrationWarning={true}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a2332" />
        <link rel="icon" href="/logocwicon.png" />
        <link rel="apple-touch-icon" href="/logocwicon.png" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>
        <Script
          id="unregister-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            if (window.location.hostname === 'localhost' && 'serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                }
              });
            }
          `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
