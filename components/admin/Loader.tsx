// Centered spinner used while admin data loads.
import { Loader2 } from "lucide-react";

export default function Loader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-neutral-400">
      <Loader2 className="h-7 w-7 animate-spin text-gold-500" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
