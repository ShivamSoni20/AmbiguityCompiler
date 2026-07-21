import { Link } from "@tanstack/react-router";

export function ProductLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-2.5"
      aria-label="Ambiguity Compiler home"
    >
      <BranchMark className="h-6 w-6 text-foreground" />
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight">
          <span className="text-foreground">Ambiguity</span>
          <span className="text-locked">Compiler</span>
        </span>
      )}
    </Link>
  );
}

export function BranchMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12h4" />
      <path d="M6 12c2 0 3-4 6-4h4" opacity="0.55" />
      <path d="M6 12h10" />
      <path d="M6 12c2 0 3 4 6 4h4" opacity="0.55" />
      <circle cx="18" cy="8" r="1.6" />
      <circle
        cx="18"
        cy="12"
        r="1.6"
        className="text-locked"
        stroke="currentColor"
        fill="currentColor"
      />
      <circle cx="18" cy="16" r="1.6" opacity="0.6" />
      <path d="M20.2 12.3l0.9 0.9 1.5-1.7" className="text-locked" stroke="currentColor" />
    </svg>
  );
}
