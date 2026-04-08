import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts, type VaultData } from "@/hooks/useContracts";
import { Shield, Plus, Vote, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

export default function Dashboard() {
  const { isConnected, address, balance, connect } = useWallet();
  const { getNextVaultId, getVault, getNextProposalId } = useContracts();
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) { setLoading(false); return; }
    const load = async () => {
      try {
        const nextId = await getNextVaultId();
        const vaultList: VaultData[] = [];
        for (let i = 0; i < nextId; i++) {
          try {
            const v = await getVault(i);
            if (v.exists && (v.owner.toLowerCase() === address?.toLowerCase())) {
              vaultList.push(v);
            }
          } catch {}
        }
        setVaults(vaultList);

        const nextPropId = await getNextProposalId();
        setPendingCount(Number(nextPropId));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <Layout>
        <EmptyState
          icon={Wallet}
          title="Connect your wallet"
          description="Connect your wallet to access the Agent Safe dashboard."
          action={<Button onClick={connect} className="gap-2"><Wallet className="h-4 w-4" /> Connect Wallet</Button>}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your Agent Safe activity</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="glass-card p-5">
            <div className="text-sm text-muted-foreground mb-1">Your Vaults</div>
            <div className="text-2xl font-bold">{loading ? "..." : vaults.length}</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-sm text-muted-foreground mb-1">Total Proposals</div>
            <div className="text-2xl font-bold">{loading ? "..." : pendingCount}</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-sm text-muted-foreground mb-1">Wallet Balance</div>
            <div className="text-2xl font-bold">{balance ? `${parseFloat(balance).toFixed(4)} XTZ` : "..."}</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <Link to="/vaults/new" className="glass-card-hover p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold">Create Vault</div>
              <div className="text-sm text-muted-foreground">Set up a new team vault with policy controls</div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
          </Link>
          <Link to="/proposals" className="glass-card-hover p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Vote className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold">View Proposals</div>
              <div className="text-sm text-muted-foreground">Review and manage pending proposals</div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
          </Link>
        </div>

        {/* Vault list */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Vaults</h2>
          {loading ? (
            <div className="glass-card p-8 text-center text-muted-foreground">Loading vaults...</div>
          ) : vaults.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No vaults yet"
              description="Create your first vault to get started with Agent Safe."
              action={
                <Link to="/vaults/new">
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Create Vault</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-3">
              {vaults.map((v) => (
                <Link key={v.id} to={`/vaults/${v.id}`} className="glass-card-hover p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{v.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{v.vault.slice(0, 10)}...</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{v.balance} XTZ</div>
                    <div className="text-xs text-muted-foreground">Vault #{v.id}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
