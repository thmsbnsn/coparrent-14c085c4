import logoSpinVideo from "@/assets/logospin.webm";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  message?: string;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-24 h-24",
  lg: "w-40 h-40",
};

export const LoadingSpinner = ({ 
  size = "md", 
  fullScreen = false,
  message 
}: LoadingSpinnerProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <video
        src={logoSpinVideo}
        autoPlay
        loop
        muted
        playsInline
        className={`${sizeClasses[size]} object-contain`}
      />
      {message && (
        <p className="text-muted-foreground text-sm animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
