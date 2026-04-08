import Layout from "@/components/Layout";
import { CONTRACTS, NETWORK, explorerAddressUrl } from "@/config/contracts";
import { ExternalLink } from "lucide-react";

export default function AdminPage() {
  return (
    <Layout>
      <div className="animate-fade-in max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Admin</h1>
        <p className="text-muted-foreground mb-8">System admin & contract info</p>

        <div className="glass-card p-6 mb-6">
          <h2 className="font-semibold mb-4">Deployed Contracts</h2>
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">AgentProposalBoard</div>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{CONTRACTS.AgentProposalBoard}</code>
                <a href={explorerAddressUrl(CONTRACTS.AgentProposalBoard)} target="_blank" rel="noopener noreferrer" className="text-primary">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">AgentSafeFactory</div>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{CONTRACTS.AgentSafeFactory}</code>
                <a href={explorerAddressUrl(CONTRACTS.AgentSafeFactory)} target="_blank" rel="noopener noreferrer" className="text-primary">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4">Network Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Network</span><span>{NETWORK.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Chain ID</span><span>{NETWORK.chainId}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">RPC</span><span className="font-mono text-xs">{NETWORK.rpcUrl}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Deployer</span><span className="font-mono text-xs">0xEd9EDd8586b20524CafA4F568413C504C9B03172</span></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
