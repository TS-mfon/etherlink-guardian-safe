import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts, type ProposalData } from "@/hooks/useContracts";
import StatusBadge from "@/components/StatusBadge";
import { Vote, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";
import { formatEther } from "ethers";
import { ACTION_TYPE_LABELS } from "@/config/contracts";

export default function ProposalsList() {
  const { isConnected, connect } = useWallet();
  const { getNextProposalId, getProposal } = useContracts();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) { setLoading(false); return; }
    const load = async () => {
      try {
        const nextId = await getNextProposalId();
        const list: ProposalData[] = [];
        for (let i = 0; i < nextId; i++) {
          try {
            const p = await getProposal(i);
            list.push(p);
          } catch {}
        }
        setProposals(list.reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Layout>
        <EmptyState
          icon={Wallet}
          title="Connect your wallet"
          description="Connect to view proposals."
          action={<Button onClick={connect} className="gap-2"><Wallet className="h-4 w-4" /> Connect Wallet</Button>}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Proposals</h1>
          <p className="text-muted-foreground mt-1">Review and manage all proposals</p>
        </div>

        {loading ? (
          <div className="glass-card p-8 text-center text-muted-foreground">Loading proposals...</div>
        ) : proposals.length === 0 ? (
          <EmptyState
            icon={Vote}
            title="No proposals yet"
            description="Proposals will appear here once submitted."
          />
        ) : (
          <div className="space-y-3">
            {proposals.map((p) => (
              <Link key={p.id} to={`/proposals/${p.id}`} className="glass-card-hover p-5 flex items-center justify-between block">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                    #{p.id}
                  </div>
                  <div>
                    <div className="font-medium">{p.reason || "No reason"}</div>
                    <div className="text-xs text-muted-foreground">
                      Vault #{p.vaultId} · {ACTION_TYPE_LABELS[p.actionType]} · {formatEther(p.value)} XTZ
                    </div>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
