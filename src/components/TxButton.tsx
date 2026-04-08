import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Check, X } from "lucide-react";
import { explorerTxUrl } from "@/config/contracts";
import { toast } from "sonner";

type TxState = "idle" | "confirming" | "pending" | "success" | "error";

interface TxButtonProps {
  onClick: () => Promise<any>;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  successMessage?: string;
  onSuccess?: (receipt: any) => void;
}

export default function TxButton({
  onClick,
  children,
  disabled,
  variant = "default",
  size = "default",
  className,
  successMessage = "Transaction confirmed",
  onSuccess,
}: TxButtonProps) {
  const [state, setState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleClick = async () => {
    setState("confirming");
    try {
      const tx = await onClick();
      if (tx?.hash) {
        setTxHash(tx.hash);
        setState("pending");
        toast.info("Transaction submitted", {
          action: {
            label: "View",
            onClick: () => window.open(explorerTxUrl(tx.hash), "_blank"),
          },
        });
        const receipt = await tx.wait();
        setState("success");
        toast.success(successMessage);
        onSuccess?.(receipt);
        setTimeout(() => {
          setState("idle");
          setTxHash(null);
        }, 3000);
      } else {
        setState("success");
        onSuccess?.(tx);
        setTimeout(() => setState("idle"), 2000);
      }
    } catch (err: any) {
      setState("error");
      const msg = err?.reason || err?.message || "Transaction failed";
      toast.error(msg);
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const isLoading = state === "confirming" || state === "pending";

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleClick}
        disabled={disabled || isLoading}
        variant={state === "error" ? "destructive" : variant}
        size={size}
        className={className}
      >
        {state === "confirming" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {state === "pending" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {state === "success" && <Check className="mr-2 h-4 w-4" />}
        {state === "error" && <X className="mr-2 h-4 w-4" />}
        {state === "confirming"
          ? "Confirm in wallet..."
          : state === "pending"
          ? "Pending..."
          : state === "success"
          ? "Success"
          : state === "error"
          ? "Failed"
          : children}
      </Button>
      {txHash && (
        <a
          href={explorerTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
