import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Layout from "./components/ui/Layout";
import { AuthProvider } from "./contexts/AuthContext";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://typefast.nvix.io"),
  title: "TypeFast - Test Your Typing Speed",
  description:
    "Test your typing speed with TypeFast from Nvix I/O - a free, modern typing speed test. Measure your WPM (Words Per Minute), accuracy, and improve your typing skills with our interactive typing test.",
  keywords: [
    "typing test",
    "typing speed test",
    "WPM calculator",
    "words per minute",
    "typing practice",
    "keyboard skills",
    "typing accuracy",
    "free typing test",
    "online typing test",
    "typing speed",
    "typing tutor",
    "keyboard typing",
  ],
  authors: [{ name: "Nvix I/O" }],
  creator: "Nvix I/O",
  publisher: "Nvix I/O",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://typefast.nvix.io",
    title: "TypeFast - Test Your Typing Speed",
    description:
      "Test your typing speed with TypeFast from Nvix I/O - a free, modern typing speed test. Measure your WPM, accuracy, and improve your typing skills.",
    siteName: "TypeFast",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TypeFast - Test Your Typing Speed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TypeFast - Test Your Typing Speed",
    description:
      "Test your typing speed with TypeFast from Nvix I/O - a free, modern typing speed test. Measure your WPM, accuracy, and improve your typing skills.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "TypeFast",
    description:
      "A free online typing speed test application to measure your WPM and improve your typing skills from Nvix I/O",
    url: "https://typefast.nvix.io",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "Nvix I/O",
      url: "https://nvix.io",
    },
    featureList: [
      "Typing speed test",
      "WPM calculation",
      "Accuracy measurement",
      "Real-time feedback",
      "Multiple test durations",
      "Mobile-friendly design",
    ],
  };

  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/words.json"
          as="fetch"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - using JSON.stringify on controlled data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
