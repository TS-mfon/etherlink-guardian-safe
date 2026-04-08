import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts, type ProposalData, type VaultData } from "@/hooks/useContracts";
import AddressDisplay from "@/components/AddressDisplay";
import StatusBadge from "@/components/StatusBadge";
import TxButton from "@/components/TxButton";
import { ArrowLeft, Vote, Wallet, CheckCircle, XCircle, Play, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";
import { formatEther } from "ethers";
import { ACTION_TYPE_LABELS, ProposalStatus } from "@/config/contracts";

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const proposalId = parseInt(id || "0");
  const { isConnected, address, connect } = useWallet();
  const contracts = useContracts();

  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [vault, setVault] = useState<VaultData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [executable, setExecutable] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!isConnected || !address) return;
    try {
      const p = await contracts.getProposal(proposalId);
      setProposal(p);
      const v = await contracts.getVault(p.vaultId);
      setVault(v);
      setIsOwner(v.owner.toLowerCase() === address.toLowerCase());
      if (p.status === ProposalStatus.Approved) {
        const can = await contracts.canExecute(proposalId);
        setExecutable(can);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, proposalId, contracts]);

  useEffect(() => { reload(); }, [reload]);

  if (!isConnected) {
    return (
      <Layout>
        <EmptyState icon={Wallet} title="Connect your wallet" description="Connect to view proposal details."
          action={<Button onClick={connect} className="gap-2"><Wallet className="h-4 w-4" /> Connect Wallet</Button>}
        />
      </Layout>
    );
  }

  if (loading) return <Layout><div className="glass-card p-8 text-center text-muted-foreground">Loading...</div></Layout>;
  if (!proposal) return <Layout><EmptyState icon={Vote} title="Proposal not found" description={`Proposal #${proposalId} does not exist.`} /></Layout>;

  const isPending = proposal.status === ProposalStatus.Pending;
  const isApproved = proposal.status === ProposalStatus.Approved;
  const expired = proposal.expiresAt > 0 && proposal.expiresAt < Math.floor(Date.now() / 1000);
  const canApprove = isOwner && isPending && !expired;
  const canReject = isOwner && isPending;
  const canExecuteNow = isOwner && isApproved && executable;
  const canCancel = (isOwner || proposal.proposer.toLowerCase() === address?.toLowerCase()) && isPending;

  return (
    <Layout>
      <div className="animate-fade-in max-w-3xl mx-auto">
        <Link to="/proposals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Proposals
        </Link>

        <div className="glass-card p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">Proposal #{proposal.id}</h1>
                <StatusBadge status={proposal.status} />
              </div>
              <p className="text-muted-foreground">{proposal.reason || "No reason provided"}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Vault #{proposal.vaultId}{vault && ` · ${vault.name}`}</div>
              {expired && isPending && <div className="text-destructive font-medium mt-1">⏰ Expired</div>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Type</div>
                <div className="font-medium">{ACTION_TYPE_LABELS[proposal.actionType]}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Target</div>
                <AddressDisplay address={proposal.target} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Value</div>
                <div className="font-medium text-lg">{formatEther(proposal.value)} XTZ</div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Proposer</div>
                <AddressDisplay address={proposal.proposer} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Created</div>
                <div>{proposal.createdAt > 0 ? new Date(proposal.createdAt * 1000).toLocaleString() : "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Expires</div>
                <div>{proposal.expiresAt > 0 ? new Date(proposal.expiresAt * 1000).toLocaleString() : "Never"}</div>
              </div>
              {proposal.actionType === 1 && proposal.data !== "0x" && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Calldata</div>
                  <div className="font-mono text-xs break-all bg-muted p-2 rounded">{proposal.data}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {(canApprove || canReject || canExecuteNow || canCancel) && (
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              {canApprove && (
                <TxButton onClick={() => contracts.approveProposal(proposalId)} successMessage="Proposal approved!" onSuccess={reload}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve
                </TxButton>
              )}
              {canReject && (
                <TxButton onClick={() => contracts.rejectProposal(proposalId)} variant="destructive" successMessage="Proposal rejected!" onSuccess={reload}>
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </TxButton>
              )}
              {canExecuteNow && (
                <TxButton onClick={() => contracts.executeProposal(proposalId)} successMessage="Proposal executed!" onSuccess={reload}>
                  <Play className="h-4 w-4 mr-2" /> Execute
                </TxButton>
              )}
              {canCancel && (
                <TxButton onClick={() => contracts.cancelProposal(proposalId)} variant="outline" successMessage="Proposal cancelled!" onSuccess={reload}>
                  <Ban className="h-4 w-4 mr-2" /> Cancel
                </TxButton>
              )}
            </div>
            {!isOwner && !canCancel && (
              <p className="text-sm text-muted-foreground mt-3">Only the vault owner can approve, reject, or execute proposals.</p>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="glass-card p-6 mt-6">
          <h3 className="font-semibold mb-4">Timeline</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Created {proposal.createdAt > 0 ? new Date(proposal.createdAt * 1000).toLocaleString() : ""}</span>
            </div>
            {proposal.approvedAt > 0 && (
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span>Approved {new Date(proposal.approvedAt * 1000).toLocaleString()}</span>
              </div>
            )}
            {proposal.executedAt > 0 && (
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>Executed {new Date(proposal.executedAt * 1000).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
