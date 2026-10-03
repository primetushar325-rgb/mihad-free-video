"use client";

import { usePlatformSettings } from "@/components/PlatformSettingsProvider";

/** Lightweight WhatsApp support launcher. Settings are fetched at runtime. */
export default function WhatsAppFloatingButton() {
  const settings = usePlatformSettings();
  if (!settings?.whatsappEnabled || !settings.whatsappVisible || !settings.whatsappPhone) return null;

  const visibility = settings.whatsappVisibility === "mobile"
    ? "md:hidden"
    : settings.whatsappVisibility === "desktop"
      ? "hidden md:flex"
      : "flex";
  const side = settings.whatsappPosition === "left" ? "left-4" : "right-4";
  const message = encodeURIComponent(settings.whatsappMessage || "Hello Mihad Free Video Support! I need help regarding your website.");
  const href = `https://wa.me/${settings.whatsappPhone}?text=${message}`;
  const label = settings.whatsappTooltip || "Chat with support on WhatsApp";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`${visibility} ${side} fixed bottom-[calc(8.5rem+env(safe-area-inset-bottom))] z-40 h-14 w-14 touch-manipulation items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/35 transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] active:scale-95 md:bottom-24`}
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 fill-current">
        <path d="M16.04 3A12.9 12.9 0 0 0 5.1 22.73L3.37 29l6.42-1.68A12.98 12.98 0 1 0 16.04 3Zm0 23.77c-1.94 0-3.84-.52-5.5-1.5l-.4-.24-3.8 1 1.02-3.7-.26-.4a10.74 10.74 0 1 1 8.94 4.84Zm5.9-8.04c-.33-.16-1.92-.95-2.22-1.06-.3-.1-.51-.16-.73.16-.21.33-.84 1.06-1.03 1.28-.19.21-.38.24-.7.08-.33-.16-1.37-.5-2.61-1.61a9.8 9.8 0 0 1-1.81-2.25c-.19-.33-.02-.5.14-.67.15-.15.33-.38.49-.57.16-.19.21-.33.32-.54.11-.22.06-.41-.02-.57-.08-.16-.73-1.76-1-2.41-.26-.64-.53-.55-.73-.56h-.62c-.22 0-.57.08-.87.4-.3.33-1.14 1.12-1.14 2.72 0 1.6 1.17 3.15 1.33 3.37.16.22 2.3 3.51 5.57 4.92.78.34 1.38.54 1.86.69.78.25 1.49.21 2.05.13.63-.1 1.92-.79 2.19-1.55.27-.76.27-1.41.19-1.55-.08-.13-.3-.21-.62-.38Z" />
      </svg>
    </a>
  );
}
