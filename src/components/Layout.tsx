import { Link, useLocation } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { NETWORK, explorerAddressUrl } from "@/config/contracts";
import { Shield, Wallet, LayoutDashboard, Vote, Settings, FileText, ChevronDown, ExternalLink, LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { path: "/app", label: "Dashboard", icon: LayoutDashboard },
  { path: "/vaults", label: "Vaults", icon: Shield },
  { path: "/proposals", label: "Proposals", icon: Vote },
  { path: "/docs", label: "Docs", icon: FileText },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { address, balance, isConnected, isCorrectNetwork, isConnecting, connect, disconnect, switchNetwork } = useWallet();
  const location = useLocation();

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">Agent Safe</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Network indicator */}
            {isConnected && !isCorrectNetwork && (
              <Button variant="destructive" size="sm" onClick={switchNetwork} className="gap-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                Wrong Network
              </Button>
            )}
            {isConnected && isCorrectNetwork && (
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success border border-success/20">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                {NETWORK.name}
              </div>
            )}

            {!isConnected ? (
              <Button onClick={connect} disabled={isConnecting} className="gap-2">
                <Wallet className="h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <span className="font-mono text-xs">{shortAddr}</span>
                    {balance && (
                      <span className="text-xs text-muted-foreground">
                        {parseFloat(balance).toFixed(3)} XTZ
                      </span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <a href={explorerAddressUrl(address!)} target="_blank" rel="noopener noreferrer" className="gap-2">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View on Explorer
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={disconnect} className="gap-2 text-destructive">
                    <LogOut className="h-3.5 w-3.5" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container py-8">{children}</main>
    </div>
  );
}
