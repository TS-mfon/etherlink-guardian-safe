import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/hooks/useContracts";
import TxButton from "@/components/TxButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Wallet, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";
import { Link } from "react-router-dom";

export default function CreateVault() {
  const { isConnected, connect } = useWallet();
  const { createVault } = useContracts();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [operators, setOperators] = useState("");
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [maxValuePerTx, setMaxValuePerTx] = useState("10");
  const [cooldownSeconds, setCooldownSeconds] = useState("60");
  const [allowedRecipients, setAllowedRecipients] = useState("");
  const [allowedTargets, setAllowedTargets] = useState("");
  const [allowNativeTransfers, setAllowNativeTransfers] = useState(true);
  const [allowContractCalls, setAllowContractCalls] = useState(false);

  if (!isConnected) {
    return (
      <Layout>
        <EmptyState
          icon={Wallet}
          title="Connect your wallet"
          description="Connect to create a vault."
          action={<Button onClick={connect} className="gap-2"><Wallet className="h-4 w-4" /> Connect Wallet</Button>}
        />
      </Layout>
    );
  }

  const parseAddressList = (s: string) => s.split(",").map((a) => a.trim()).filter((a) => a.length === 42);

  const handleCreate = async () => {
    const tx = await createVault(name, parseAddressList(operators), {
      approvalRequired,
      maxValuePerTx,
      cooldownSeconds: parseInt(cooldownSeconds),
      allowedRecipients: parseAddressList(allowedRecipients),
      allowedTargets: parseAddressList(allowedTargets),
      allowNativeTransfers,
      allowContractCalls,
    });
    return tx;
  };

  return (
    <Layout>
      <div className="animate-fade-in max-w-2xl mx-auto">
        <Link to="/vaults" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Vaults
        </Link>

        <h1 className="text-2xl font-bold mb-2">Create New Vault</h1>
        <p className="text-muted-foreground mb-8">Set up a team vault with policy controls.</p>

        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Basic Info</h2>
            <div>
              <Label htmlFor="name">Vault Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Team Treasury" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="operators">Operators (comma-separated addresses)</Label>
              <Input id="operators" value={operators} onChange={(e) => setOperators(e.target.value)} placeholder="0x..." className="mt-1.5 font-mono text-sm" />
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Policy</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Approval Required</div>
                <div className="text-xs text-muted-foreground">Owner must approve proposals before execution</div>
              </div>
              <Switch checked={approvalRequired} onCheckedChange={setApprovalRequired} />
            </div>
            <div>
              <Label>Max Value Per Transaction (XTZ)</Label>
              <Input value={maxValuePerTx} onChange={(e) => setMaxValuePerTx(e.target.value)} type="number" className="mt-1.5" />
            </div>
            <div>
              <Label>Cooldown (seconds)</Label>
              <Input value={cooldownSeconds} onChange={(e) => setCooldownSeconds(e.target.value)} type="number" className="mt-1.5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Allow Native Transfers</div>
                <div className="text-xs text-muted-foreground">Allow XTZ transfers from this vault</div>
              </div>
              <Switch checked={allowNativeTransfers} onCheckedChange={setAllowNativeTransfers} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Allow Contract Calls</div>
                <div className="text-xs text-muted-foreground">Allow arbitrary contract calls</div>
              </div>
              <Switch checked={allowContractCalls} onCheckedChange={setAllowContractCalls} />
            </div>
            <div>
              <Label>Allowed Recipients (optional, comma-separated)</Label>
              <Input value={allowedRecipients} onChange={(e) => setAllowedRecipients(e.target.value)} placeholder="0x..." className="mt-1.5 font-mono text-sm" />
              <p className="text-xs text-muted-foreground mt-1">Leave empty to allow all recipients</p>
            </div>
            <div>
              <Label>Allowed Targets (optional, comma-separated)</Label>
              <Input value={allowedTargets} onChange={(e) => setAllowedTargets(e.target.value)} placeholder="0x..." className="mt-1.5 font-mono text-sm" />
              <p className="text-xs text-muted-foreground mt-1">Leave empty to allow all contract targets</p>
            </div>
          </div>

          <TxButton
            onClick={handleCreate}
            disabled={!name.trim()}
            successMessage="Vault created successfully!"
            onSuccess={() => navigate("/vaults")}
            className="w-full"
          >
            Create Vault
          </TxButton>
        </div>
      </div>
    </Layout>
  );
}
