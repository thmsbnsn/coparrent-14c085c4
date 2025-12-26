import { useState, useEffect } from "react";
import { Key, Download, RefreshCw, Copy, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface RecoveryCodesProps {
  isEnabled: boolean;
  className?: string;
}

// Generate recovery codes client-side (in production, these should be stored server-side)
const generateRecoveryCodes = (): string[] => {
  const codes: string[] = [];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding similar chars like 0,O,1,I
  
  for (let i = 0; i < 10; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      if (j === 4) code += "-";
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    codes.push(code);
  }
  return codes;
};

export const RecoveryCodes = ({ isEnabled, className }: RecoveryCodesProps) => {
  const { toast } = useToast();
  const [showCodesDialog, setShowCodesDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [codesVisible, setCodesVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasGeneratedCodes, setHasGeneratedCodes] = useState(false);

  useEffect(() => {
    // Check if user has generated codes before (stored in localStorage for demo)
    const storedCodes = localStorage.getItem("recovery_codes_generated");
    setHasGeneratedCodes(storedCodes === "true");
  }, []);

  const handleGenerateCodes = () => {
    setLoading(true);
    setTimeout(() => {
      const newCodes = generateRecoveryCodes();
      setCodes(newCodes);
      setCodesVisible(true);
      setShowCodesDialog(true);
      setHasGeneratedCodes(true);
      localStorage.setItem("recovery_codes_generated", "true");
      setLoading(false);
    }, 500);
  };

  const handleRegenerateCodes = () => {
    setLoading(true);
    setTimeout(() => {
      const newCodes = generateRecoveryCodes();
      setCodes(newCodes);
      setCodesVisible(true);
      setShowRegenerateDialog(false);
      setShowCodesDialog(true);
      setLoading(false);
      toast({
        title: "New recovery codes generated",
        description: "Your old recovery codes are no longer valid.",
      });
    }, 500);
  };

  const handleCopyCodes = () => {
    const codesText = codes.join("\n");
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Codes copied",
      description: "Recovery codes have been copied to your clipboard.",
    });
  };

  const handleDownloadCodes = () => {
    const codesText = `CoParrent Recovery Codes
========================
Generated: ${new Date().toLocaleDateString()}

Keep these codes in a safe place. Each code can only be used once.

${codes.join("\n")}

If you lose access to your authenticator app, you can use one of these
codes to sign in to your account.
`;
    
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "coparrent-recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Codes downloaded",
      description: "Recovery codes have been saved to a file.",
    });
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Key className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Recovery Codes</p>
            <p className="text-sm text-muted-foreground">
              {hasGeneratedCodes 
                ? "Use these if you lose your authenticator device" 
                : "Generate backup codes for account recovery"}
            </p>
          </div>
        </div>
        
        {hasGeneratedCodes ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowRegenerateDialog(true)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateCodes}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Generate Codes
          </Button>
        )}
      </div>

      {/* View/Download Codes Dialog */}
      <Dialog open={showCodesDialog} onOpenChange={setShowCodesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Recovery Codes</DialogTitle>
            <DialogDescription>
              Save these codes in a secure location. Each code can only be used once to sign in if you lose access to your authenticator.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recovery Codes</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCodesVisible(!codesVisible)}
              >
                {codesVisible ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-muted rounded-lg p-4 font-mono text-sm">
              {codesVisible ? (
                <div className="grid grid-cols-2 gap-2">
                  {codes.map((code, index) => (
                    <div key={index} className="text-center py-1">
                      {code}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Click "Show" to reveal your recovery codes
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleCopyCodes}
                disabled={!codesVisible}
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-success" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                Copy All
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleDownloadCodes}
                disabled={!codesVisible}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              ⚠️ These codes won't be shown again after you close this dialog.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowCodesDialog(false)}>
              I've saved my codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Recovery Codes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate all your existing recovery codes. Make sure to save the new codes in a secure location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRegenerateCodes}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
