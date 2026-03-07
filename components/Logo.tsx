interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "short" | "full";
  href?: string;
}

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-2xl",
};

export function Logo({
  size = "md",
  className = "",
  variant = "short",
  href,
}: LogoProps) {
  const text = variant === "full" ? "Git To Know Me" : "GTNM";

  const logoElement = (
    <div className={className}>
      <span
        className={`font-mono font-bold text-slate-300 ${textSizeClasses[size]}`}
      >
        {text}
      </span>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="hover:opacity-80 transition-opacity">
        {logoElement}
      </a>
    );
  }

  return logoElement;
}
