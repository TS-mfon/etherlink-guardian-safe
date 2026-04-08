import { ExternalLink, Copy, Check } from "lucide-react";
import { explorerAddressUrl } from "@/config/contracts";
import { useState } from "react";

interface AddressDisplayProps {
  address: string;
  label?: string;
  short?: boolean;
}

export default function AddressDisplay({ address, label, short = true }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  const display = short ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;

  const copy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <span className="font-mono text-sm text-foreground">{display}</span>
      <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors">
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <a
        href={explorerAddressUrl(address)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
