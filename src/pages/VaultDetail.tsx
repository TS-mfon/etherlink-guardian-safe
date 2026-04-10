import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts, type VaultData, type PolicyData } from "@/hooks/useContracts";
import AddressDisplay from "@/components/AddressDisplay";
import TxButton from "@/components/TxButton";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ArrowLeft, Send, UserPlus, UserMinus, Settings, Vote, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";
import { formatEther } from "ethers";
import { BACKEND } from "@/config/contracts";
import { toast } from "sonner";

export default function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const vaultId = parseInt(id || "0");
  const { isConnected, address, connect } = useWallet();
  const contracts = useContracts();

  const [vault, setVault] = useState<VaultData | null>(null);
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isOp, setIsOp] = useState(false);
  const [loading, setLoading] = useState(true);

  // Deposit
  const [depositAmount, setDepositAmount] = useState("");
  // Add operator
  const [newOperator, setNewOperator] = useState("");
  const [removeOpAddr, setRemoveOpAddr] = useState("");

  // Proposal form
  const [propTarget, setPropTarget] = useState("");
  const [propValue, setPropValue] = useState("");
  const [propData, setPropData] = useState("0x");
  const [propActionType, setPropActionType] = useState(0);
  const [propReason, setPropReason] = useState("");
  const [propExpiry, setPropExpiry] = useState("24");

  // AI preview
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Policy edit
  const [editPolicy, setEditPolicy] = useState(false);
  const [pApproval, setPApproval] = useState(true);
  const [pMaxVal, setPMaxVal] = useState("10");
  const [pCooldown, setPCooldown] = useState("60");
  const [pNative, setPNative] = useState(true);
  const [pCalls, setPCalls] = useState(false);
  const [pRecipients, setPRecipients] = useState("");
  const [pTargets, setPTargets] = useState("");

  const reload = useCallback(async () => {
    if (!isConnected || !address) return;
    try {
      const v = await contracts.getVault(vaultId);
      setVault(v);
      const p = await contracts.getPolicy(vaultId);
      setPolicy(p);
      setIsOwner(v.owner.toLowerCase() === address.toLowerCase());
      const op = await contracts.isOperator(vaultId, address);
      setIsOp(op);
      // Seed policy form
      setPApproval(p.approvalRequired);
      setPMaxVal(formatEther(p.maxValuePerTx));
      setPCooldown(String(p.cooldownSeconds));
      setPNative(p.allowNativeTransfers);
      setPCalls(p.allowContractCalls);
      setPRecipients(p.allowedRecipients.join(", "));
      setPTargets(p.allowedTargets.join(", "));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, vaultId, contracts]);

  useEffect(() => { reload(); }, [reload]);

  const parseAddrs = (s: string) => s.split(",").map(a => a.trim()).filter(a => a.length === 42);

  const handleAiPreview = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`${BACKEND.agentServiceBaseUrl}/agent/proposal-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaultId, prompt: aiPrompt }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Backend error (${res.status}): ${errBody}`);
      }
      const data = await res.json();
      setAiPreview(data);
      // Pre-fill proposal form from normalized response
      const n = data.normalized;
      if (n) {
        if (n.target) setPropTarget(n.target);
        if (n.valueXtz) setPropValue(n.valueXtz);
        if (n.dataHex) setPropData(n.dataHex);
        if (n.actionType !== undefined) setPropActionType(n.actionType);
        if (n.reason) setPropReason(n.reason);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to get proposal preview");
    } finally {
      setAiLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <EmptyState
          icon={Wallet}
          title="Connect your wallet"
          description="Connect to view vault details."
          action={<Button onClick={connect} className="gap-2"><Wallet className="h-4 w-4" /> Connect Wallet</Button>}
        />
      </Layout>
    );
  }

  if (loading) {
    return <Layout><div className="glass-card p-8 text-center text-muted-foreground">Loading vault...</div></Layout>;
  }

  if (!vault?.exists) {
    return (
      <Layout>
        <EmptyState
          icon={Shield}
          title="Vault not found"
          description={`Vault #${vaultId} does not exist.`}
          action={<Link to="/vaults"><Button variant="outline">Back to Vaults</Button></Link>}
        />
      </Layout>
    );
  }

  const canManage = isOwner;
  const canPropose = isOwner || isOp;

  return (
    <Layout>
      <div className="animate-fade-in">
        <Link to="/vaults" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Vaults
        </Link>

        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{vault.name}</h1>
                <AddressDisplay address={vault.vault} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{parseFloat(vault.balance || "0").toFixed(4)} <span className="text-lg text-muted-foreground">XTZ</span></div>
              <div className="text-sm text-muted-foreground mt-1">
                {isOwner ? "👑 Owner" : isOp ? "🔧 Operator" : "👁 Viewer"}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="propose">Propose</TabsTrigger>
            {canManage && <TabsTrigger value="manage">Manage</TabsTrigger>}
            {canManage && <TabsTrigger value="policy">Policy</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-card p-5">
                <h3 className="font-semibold mb-3">Vault Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Vault ID</span><span>#{vaultId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Owner</span><AddressDisplay address={vault.owner} /></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Contract</span><AddressDisplay address={vault.vault} /></div>
                </div>
              </div>
              {policy && (
                <div className="glass-card p-5">
                  <h3 className="font-semibold mb-3">Policy</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Approval Required</span><span>{policy.approvalRequired ? "Yes" : "No"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Max per TX</span><span>{formatEther(policy.maxValuePerTx)} XTZ</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Cooldown</span><span>{policy.cooldownSeconds}s</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Native Transfers</span><span>{policy.allowNativeTransfers ? "✅" : "❌"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Contract Calls</span><span>{policy.allowContractCalls ? "✅" : "❌"}</span></div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="deposit">
            <div className="glass-card p-6 max-w-md">
              <h3 className="font-semibold mb-4">Deposit XTZ</h3>
              <div className="space-y-4">
                <div>
                  <Label>Amount (XTZ)</Label>
                  <Input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} type="number" step="0.001" placeholder="0.0" className="mt-1.5" />
                </div>
                <TxButton
                  onClick={() => contracts.depositToVault(vaultId, depositAmount)}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  successMessage="Deposit successful!"
                  onSuccess={reload}
                >
                  <Send className="h-4 w-4 mr-2" /> Deposit
                </TxButton>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="propose">
            {!canPropose ? (
              <div className="glass-card p-6 text-center text-muted-foreground">
                Only owners and operators can submit proposals.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* AI Preview */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">🤖 AI Proposal Preview</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Describe what you want to do and the AI will prepare a proposal for review.
                  </p>
                  <div className="space-y-3">
                    <Input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. Send 1 XTZ to 0x..." />
                    <Button onClick={handleAiPreview} disabled={!aiPrompt || aiLoading} variant="secondary" className="w-full">
                      {aiLoading ? "Generating..." : "Generate Preview"}
                    </Button>
                    {aiPreview && (
                      <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                        <div><span className="text-muted-foreground">Target:</span> <span className="font-mono">{aiPreview.target}</span></div>
                        <div><span className="text-muted-foreground">Value:</span> {aiPreview.value} XTZ</div>
                        <div><span className="text-muted-foreground">Type:</span> {aiPreview.actionType === 0 ? "Native Transfer" : "Contract Call"}</div>
                        <div><span className="text-muted-foreground">Reason:</span> {aiPreview.reason}</div>
                        <p className="text-xs text-muted-foreground mt-2">Review the details, then submit using the form →</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual form */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><Vote className="h-4 w-4" /> Submit Proposal</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Action Type</Label>
                      <select
                        value={propActionType}
                        onChange={(e) => setPropActionType(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value={0}>Native Transfer</option>
                        <option value={1}>Contract Call</option>
                      </select>
                    </div>
                    <div>
                      <Label>Target Address</Label>
                      <Input value={propTarget} onChange={(e) => setPropTarget(e.target.value)} placeholder="0x..." className="mt-1.5 font-mono text-sm" />
                    </div>
                    <div>
                      <Label>Value (XTZ)</Label>
                      <Input value={propValue} onChange={(e) => setPropValue(e.target.value)} type="number" step="0.001" placeholder="0.0" className="mt-1.5" />
                    </div>
                    {propActionType === 1 && (
                      <div>
                        <Label>Calldata (hex)</Label>
                        <Input value={propData} onChange={(e) => setPropData(e.target.value)} placeholder="0x..." className="mt-1.5 font-mono text-sm" />
                      </div>
                    )}
                    <div>
                      <Label>Reason</Label>
                      <Input value={propReason} onChange={(e) => setPropReason(e.target.value)} placeholder="Payment for..." className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Expiry (hours)</Label>
                      <Input value={propExpiry} onChange={(e) => setPropExpiry(e.target.value)} type="number" className="mt-1.5" />
                    </div>
                    <TxButton
                      onClick={() => {
                        const expiresAt = Math.floor(Date.now() / 1000) + parseInt(propExpiry) * 3600;
                        return contracts.submitProposal(vaultId, propTarget, propValue || "0", propData, propActionType, propReason, expiresAt);
                      }}
                      disabled={!propTarget || !propReason}
                      successMessage="Proposal submitted!"
                      onSuccess={reload}
                    >
                      Submit Proposal
                    </TxButton>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {canManage && (
            <TabsContent value="manage">
              <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><UserPlus className="h-4 w-4" /> Add Operator</h3>
                  <div className="space-y-3">
                    <Input value={newOperator} onChange={(e) => setNewOperator(e.target.value)} placeholder="0x..." className="font-mono text-sm" />
                    <TxButton
                      onClick={() => contracts.addOperator(vaultId, newOperator)}
                      disabled={!newOperator || newOperator.length !== 42}
                      successMessage="Operator added!"
                      onSuccess={() => { setNewOperator(""); reload(); }}
                    >
                      Add Operator
                    </TxButton>
                  </div>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><UserMinus className="h-4 w-4" /> Remove Operator</h3>
                  <div className="space-y-3">
                    <Input value={removeOpAddr} onChange={(e) => setRemoveOpAddr(e.target.value)} placeholder="0x..." className="font-mono text-sm" />
                    <TxButton
                      onClick={() => contracts.removeOperator(vaultId, removeOpAddr)}
                      disabled={!removeOpAddr || removeOpAddr.length !== 42}
                      variant="destructive"
                      successMessage="Operator removed!"
                      onSuccess={() => { setRemoveOpAddr(""); reload(); }}
                    >
                      Remove Operator
                    </TxButton>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {canManage && (
            <TabsContent value="policy">
              <div className="glass-card p-6 max-w-xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Settings className="h-4 w-4" /> Update Policy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Approval Required</Label>
                    <Switch checked={pApproval} onCheckedChange={setPApproval} />
                  </div>
                  <div><Label>Max Value per TX (XTZ)</Label><Input value={pMaxVal} onChange={(e) => setPMaxVal(e.target.value)} type="number" className="mt-1.5" /></div>
                  <div><Label>Cooldown (seconds)</Label><Input value={pCooldown} onChange={(e) => setPCooldown(e.target.value)} type="number" className="mt-1.5" /></div>
                  <div className="flex items-center justify-between"><Label>Allow Native Transfers</Label><Switch checked={pNative} onCheckedChange={setPNative} /></div>
                  <div className="flex items-center justify-between"><Label>Allow Contract Calls</Label><Switch checked={pCalls} onCheckedChange={setPCalls} /></div>
                  <div><Label>Allowed Recipients</Label><Input value={pRecipients} onChange={(e) => setPRecipients(e.target.value)} placeholder="Comma-separated" className="mt-1.5 font-mono text-sm" /></div>
                  <div><Label>Allowed Targets</Label><Input value={pTargets} onChange={(e) => setPTargets(e.target.value)} placeholder="Comma-separated" className="mt-1.5 font-mono text-sm" /></div>
                  <TxButton
                    onClick={() => contracts.updatePolicy(vaultId, {
                      approvalRequired: pApproval,
                      maxValuePerTx: pMaxVal,
                      cooldownSeconds: parseInt(pCooldown),
                      allowedRecipients: parseAddrs(pRecipients),
                      allowedTargets: parseAddrs(pTargets),
                      allowNativeTransfers: pNative,
                      allowContractCalls: pCalls,
                    })}
                    successMessage="Policy updated!"
                    onSuccess={reload}
                  >
                    Update Policy
                  </TxButton>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
