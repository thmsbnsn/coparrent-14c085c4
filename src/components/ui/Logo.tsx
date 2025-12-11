import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, showText = true, size = "md" }: LogoProps) => {
  const sizes = {
    sm: { icon: "w-6 h-6", text: "text-lg" },
    md: { icon: "w-8 h-8", text: "text-xl" },
    lg: { icon: "w-12 h-12", text: "text-3xl" },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative", sizes[size].icon)}>
        {/* Nest Icon */}
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          {/* Outer nest curves */}
          <path
            d="M6 28C6 28 8 18 20 18C32 18 34 28 34 28"
            stroke="url(#nestGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M10 30C10 30 12 22 20 22C28 22 30 30 30 30"
            stroke="url(#nestGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M14 32C14 32 15 26 20 26C25 26 26 32 26 32"
            stroke="url(#nestGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Center dot representing child/family */}
          <circle cx="20" cy="14" r="4" fill="url(#dotGradient)" />
          <defs>
            <linearGradient id="nestGradient" x1="6" y1="18" x2="34" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(222, 47%, 20%)" />
              <stop offset="1" stopColor="hsl(174, 42%, 35%)" />
            </linearGradient>
            <linearGradient id="dotGradient" x1="16" y1="10" x2="24" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(174, 42%, 40%)" />
              <stop offset="1" stopColor="hsl(150, 45%, 45%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className={cn("font-display font-bold tracking-tight", sizes[size].text)}>
          <span className="text-primary">Clear</span>
          <span className="text-gradient bg-gradient-accent">Nest</span>
        </span>
      )}
    </div>
  );
};
