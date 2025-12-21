import { cn } from "@/lib/utils";
import logoSvg from "@/assets/coparrent-logo.svg";

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
      <img 
        src={logoSvg} 
        alt="CoParrent Logo" 
        className={cn(sizes[size].icon)}
      />
      {showText && (
        <span className={cn("font-display font-bold tracking-tight", sizes[size].text)}>
          <span className="text-primary">Co</span>
          <span className="text-gradient bg-gradient-accent">Parrent</span>
        </span>
      )}
    </div>
  );
};
