import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts, type VaultData } from "@/hooks/useContracts";
import { Shield, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

export default function VaultsList() {
  const { isConnected, address, connect } = useWallet();
  const { getNextVaultId, getVault, isOperator } = useContracts();
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !address) { setLoading(false); return; }
    const load = async () => {
      try {
        const nextId = await getNextVaultId();
        const list: VaultData[] = [];
        for (let i = 0; i < nextId; i++) {
          try {
            const v = await getVault(i);
            if (!v.exists) continue;
            const isOwner = v.owner.toLowerCase() === address.toLowerCase();
            const isOp = await isOperator(i, address);
            if (isOwner || isOp) list.push(v);
          } catch {}
        }
        setVaults(list);
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
          description="Connect to view your vaults."
          action={<Button onClick={connect} className="gap-2"><Wallet className="h-4 w-4" /> Connect Wallet</Button>}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Vaults</h1>
            <p className="text-muted-foreground mt-1">Manage your team vaults</p>
          </div>
          <Link to="/vaults/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Vault</Button>
          </Link>
        </div>

        {loading ? (
          <div className="glass-card p-8 text-center text-muted-foreground">Loading vaults...</div>
        ) : vaults.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No vaults found"
            description="You don't own or operate any vaults yet."
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
                    <div className="text-xs text-muted-foreground font-mono">{v.vault.slice(0, 10)}...{v.vault.slice(-4)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{parseFloat(v.balance || "0").toFixed(4)} XTZ</div>
                  <div className="text-xs text-muted-foreground">Vault #{v.id}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
