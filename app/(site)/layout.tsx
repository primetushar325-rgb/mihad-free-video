import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import AdSlot from "@/components/site/AdSlot";
import VisitTracker from "@/components/site/VisitTracker";
import GiveawayWidget from "@/components/giveaway/GiveawayWidget";

// Shared chrome for all public pages: sticky header + footer with ads.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <VisitTracker />
      <GiveawayWidget />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-3 pt-4 sm:px-5">
          <AdSlot slot="header" />
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}
