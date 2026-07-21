export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

export function SkeletonTable({ rows = 6, cols = 6 }) {
  return (
    <div className="card p-4">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonBlock key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5">
          <SkeletonBlock className="h-4 w-24 mb-3" />
          <SkeletonBlock className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}
