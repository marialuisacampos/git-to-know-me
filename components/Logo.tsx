import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  href?: string;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-2xl",
};

export function Logo({
  size = "md",
  className = "",
  showText = true,
  href,
}: LogoProps) {
  const logoElement = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <Image
          src="/favicon.svg"
          alt="Git to Know Me"
          width={
            size === "sm" ? 24 : size === "md" ? 32 : size === "lg" ? 48 : 64
          }
          height={
            size === "sm" ? 24 : size === "md" ? 32 : size === "lg" ? 48 : 64
          }
          className="w-full h-full"
        />
      </div>
      {showText && (
        <span className={`text-slate-300 ${textSizeClasses[size]}`}>
          Git to Know Me
        </span>
      )}
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
