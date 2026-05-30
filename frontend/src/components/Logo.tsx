import { clsx } from "clsx";

type LogoProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  monoLight?: boolean;
};

/**
 * Food Villa logo — an elegant SVG monogram.
 * Warm rounded square with a stylized "FV" + fork motif.
 * Used in the header, footer, and auth pages.
 */
export function Logo({
  size = 40,
  withWordmark = true,
  className,
  monoLight = false,
}: LogoProps) {
  const markId = `fv-grad-${Math.random().toString(36).slice(2, 8)}`;
  const fillColor = monoLight ? "#FFFFFF" : `url(#${markId})`;

  return (
    <div
      className={clsx("inline-flex items-center gap-3", className)}
      aria-label="Food Villa"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={markId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF8147" />
            <stop offset="55%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#E85420" />
          </linearGradient>
        </defs>

        {/* Rounded badge background */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          fill={fillColor}
        />

        {/* Inner highlight ring */}
        <rect
          x="6"
          y="6"
          width="52"
          height="52"
          rx="13"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.2"
        />

        {/* Stylized F */}
        <path
          d="M19 18 H32 V23 H24 V29 H30 V34 H24 V46 H19 Z"
          fill="#FFF8F0"
        />

        {/* Stylized V with fork tine accent */}
        <path
          d="M33 18 H38 L41.5 36 L45 18 H50 L44 46 H39 Z"
          fill="#FFF8F0"
        />

        {/* Decorative fork dot accent */}
        <circle cx="46" cy="46" r="2.4" fill="#FFB400" />
      </svg>

      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={clsx(
              "font-display text-xl font-semibold tracking-tight",
              monoLight ? "text-white" : "text-ink",
            )}
          >
            Food<span className="text-brand-500">Villa</span>
          </span>
          <span
            className={clsx(
              "mt-0.5 text-[10px] uppercase tracking-[0.18em]",
              monoLight ? "text-white/70" : "text-ink-muted",
            )}
          >
            Taste the Comfort
          </span>
        </div>
      )}
    </div>
  );
}

export default Logo;
