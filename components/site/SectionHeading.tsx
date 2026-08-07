// Section heading used across public pages.
export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-extrabold text-white sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 max-w-2xl text-sm text-neutral-400">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
