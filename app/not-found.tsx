// Beautiful 404 page.
import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <h1 className="select-none font-display text-[8rem] font-black leading-none text-gold-gradient opacity-30 sm:text-[12rem]">
        404
      </h1>
      <div className="-mt-6">
        <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
          Page not found
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-400">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn-gold">
            <Home className="h-4 w-4" /> Go home
          </Link>
          <Link href="/search" className="btn-ghost">
            <Search className="h-4 w-4" /> Search videos
          </Link>
        </div>
      </div>
    </div>
  );
}
