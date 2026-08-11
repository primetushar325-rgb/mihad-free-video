import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { SettingsProvider } from "@/components/SettingsProvider";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { getSettingsSafe } from "@/lib/safe";
import { siteUrl, siteName } from "@/lib/utils";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettingsSafe();
  const name = settings.websiteName || siteName();
  const url = siteUrl();
  const description =
    "Browse and download free premium videos. Fast, mobile-first and 100% free.";

  return {
    metadataBase: new URL(url),
    title: {
      default: `${name} — Free Video Library`,
      template: `%s — ${name}`,
    },
    description,
    applicationName: name,
    keywords: [
      "free videos",
      "video download",
      "anime",
      "movies",
      "gaming",
      "music",
      "education",
      name,
    ],
    authors: [{ name }],
    creator: name,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: settings.faviconUrl || "/icons/icon-192.png",
      apple: settings.logoUrl || "/icons/icon-192.png",
    },
    openGraph: {
      type: "website",
      siteName: name,
      title: `${name} — Free Video Library`,
      description,
      url,
      images: [
        {
          url: settings.logoUrl || "/icons/icon-512.png",
          width: 512,
          height: 512,
          alt: name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Free Video Library`,
      description,
      images: [settings.logoUrl || "/icons/icon-512.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    alternates: { canonical: url },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettingsSafe();

  // Inject the AdSense library script if a publisher client id is set.
  const adsenseClient = settings.adsenseClient?.trim();

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} dark`}>
      <head>
        <meta name="monetag" content="f622def877abebe418e5d809d67d9c50" />
        {/* Ad code #2 */}
        <script
          src="https://5gvci.com/act/files/tag.min.js?z=11550589"
          data-cfasync="false"
          async
        />
        {/* Ad code #3 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='11550590',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />
        {adsenseClient && settings.enableAds && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mihad Free Video" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: settings.websiteName || "Mihad Free Video",
              url: siteUrl(),
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl()}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <SettingsProvider settings={settings}>
          <ToastProvider>
            {children}
            <InstallPrompt />
            <ServiceWorkerRegister />
          </ToastProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
