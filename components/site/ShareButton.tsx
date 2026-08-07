"use client";

// Share button using the Web Share API with clipboard fallback.
import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

export default function ShareButton({
  title,
  url,
}: {
  title: string;
  url?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function share() {
    const shareUrl = url || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  }

  return (
    <button onClick={share} className="btn-ghost w-full sm:w-auto" aria-label="Share">
      {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
      Share
    </button>
  );
}
