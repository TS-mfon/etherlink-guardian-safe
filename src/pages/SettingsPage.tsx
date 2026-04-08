import Layout from "@/components/Layout";
import { useWallet } from "@/contexts/WalletContext";
import { NETWORK, CONTRACTS, explorerAddressUrl } from "@/config/contracts";
import AddressDisplay from "@/components/AddressDisplay";
import { ExternalLink, Globe, Hash, Coins } from "lucide-react";

export default function SettingsPage() {
  const { address, balance, chainId, isConnected, isCorrectNetwork } = useWallet();

  return (
    <Layout>
      <div className="animate-fade-in max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Network and account information</p>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Globe className="h-4 w-4" /> Network</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Network</span><span>{NETWORK.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Chain ID</span><span>{NETWORK.chainId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">RPC</span><span className="font-mono text-xs">{NETWORK.rpcUrl}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span>{NETWORK.currencySymbol}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Explorer</span>
                <a href={NETWORK.explorerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-xs">
                  {NETWORK.explorerUrl} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {isConnected && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span className={isCorrectNetwork ? "text-success" : "text-destructive"}>
                    {isCorrectNetwork ? "✅ Connected" : `❌ Wrong network (chain ${chainId})`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Hash className="h-4 w-4" /> Contracts</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">AgentSafeFactory</span>
                <AddressDisplay address={CONTRACTS.AgentSafeFactory} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">AgentProposalBoard</span>
                <AddressDisplay address={CONTRACTS.AgentProposalBoard} />
              </div>
            </div>
          </div>

          {isConnected && (
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Coins className="h-4 w-4" /> Account</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Address</span>
                  <AddressDisplay address={address!} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span>{balance ? `${parseFloat(balance).toFixed(6)} XTZ` : "..."}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
