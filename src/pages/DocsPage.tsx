import Layout from "@/components/Layout";
import { Shield, Vote, Lock, Users, Zap, FileText, ArrowRight, ExternalLink } from "lucide-react";
import { NETWORK, CONTRACTS, explorerAddressUrl } from "@/config/contracts";

export default function DocsPage() {
  return (
    <Layout>
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4 border border-primary/20">
            <FileText className="h-3.5 w-3.5" /> Documentation
          </div>
          <h1 className="text-3xl font-bold mb-2">Etherlink Agent Safe</h1>
          <p className="text-lg text-muted-foreground">
            AI-assisted onchain operations for small teams on Etherlink.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Overview</h2>
          <div className="glass-card p-6 space-y-4 text-sm leading-relaxed text-foreground/90">
            <p>
              Etherlink Agent Safe lets teams use AI to prepare onchain actions — without giving the AI 
              unrestricted control of funds. Smart contracts enforce every policy rule. The AI only proposes 
              actions; the team owner approves and executes.
            </p>
            <p>
              <strong>Problem:</strong> Teams want AI help with treasury actions and payments, but they do not 
              want to hand unrestricted control of funds to an agent.
            </p>
            <p>
              <strong>Solution:</strong> The AI only proposes actions. Smart contracts enforce policy. The team 
              owner approves and executes.
            </p>
          </div>
        </section>

        {/* Core Flow */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Core Flow</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { step: "1", title: "Create Vault", desc: "Owner creates a vault with policy rules, spending limits, and operator addresses.", icon: Shield },
              { step: "2", title: "Set Policy", desc: "Define approval requirements, max transaction values, cooldowns, and allowed recipients.", icon: Lock },
              { step: "3", title: "Add Operators", desc: "Add team members who can submit proposals but cannot approve or execute.", icon: Users },
              { step: "4", title: "Submit Proposals", desc: "Operators or AI submit proposals for native transfers or contract calls.", icon: Vote },
              { step: "5", title: "Review & Approve", desc: "Owner reviews proposal details and approves or rejects onchain.", icon: Zap },
              { step: "6", title: "Execute", desc: "Owner executes approved proposals. Smart contracts enforce all policy rules.", icon: ArrowRight },
            ].map((item) => (
              <div key={item.step} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {item.step}
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Roles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">👑 Owner</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Create and manage vaults</li>
                <li>• Set and update policy</li>
                <li>• Add and remove operators</li>
                <li>• Approve and reject proposals</li>
                <li>• Execute approved proposals</li>
                <li>• Submit proposals</li>
              </ul>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">🔧 Operator</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Submit proposals</li>
                <li>• Use AI proposal preview</li>
                <li>• View vault and proposal data</li>
                <li>• Cancel own proposals</li>
                <li className="text-destructive/70">• Cannot approve or execute</li>
                <li className="text-destructive/70">• Cannot change policy</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Action Types */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Action Types</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-2">Native Transfer</h3>
              <p className="text-sm text-muted-foreground">Send XTZ from the vault to a target address. Subject to max value and recipient restrictions.</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-2">Contract Call</h3>
              <p className="text-sm text-muted-foreground">Execute arbitrary contract calls with optional value. Subject to target restrictions and policy checks.</p>
            </div>
          </div>
        </section>

        {/* Policy */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Policy Configuration</h2>
          <div className="glass-card p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium">Parameter</th>
                    <th className="text-left py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-2 pr-4 font-mono text-xs">approvalRequired</td><td className="py-2 text-muted-foreground">Whether owner must approve before execution</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">maxValuePerTx</td><td className="py-2 text-muted-foreground">Maximum XTZ value per transaction</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">cooldownSeconds</td><td className="py-2 text-muted-foreground">Minimum time between executions</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">allowedRecipients</td><td className="py-2 text-muted-foreground">Whitelist of allowed transfer recipients (empty = all)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">allowedTargets</td><td className="py-2 text-muted-foreground">Whitelist of allowed contract targets (empty = all)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">allowNativeTransfers</td><td className="py-2 text-muted-foreground">Whether native XTZ transfers are enabled</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">allowContractCalls</td><td className="py-2 text-muted-foreground">Whether arbitrary contract calls are enabled</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Backend Endpoints */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Backend API</h2>
          <div className="glass-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground mb-4">The backend service provides AI proposal generation. It does NOT have custody of funds.</p>
            <div className="space-y-3">
              {[
                { method: "GET", path: "/health", desc: "Health check" },
                { method: "POST", path: "/agent/proposal-preview", desc: "Generate AI proposal preview from natural language" },
                { method: "POST", path: "/agent/proposal-submit", desc: "Submit proposal via backend (optional)" },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center gap-3 text-sm">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded ${ep.method === "GET" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                    {ep.method}
                  </span>
                  <code className="font-mono text-xs">{ep.path}</code>
                  <span className="text-muted-foreground">— {ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contracts */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Live Contracts</h2>
          <div className="glass-card p-6 space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Network</span>
              <span>{NETWORK.name} (Chain ID: {NETWORK.chainId})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">AgentSafeFactory</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs">{CONTRACTS.AgentSafeFactory}</code>
                <a href={explorerAddressUrl(CONTRACTS.AgentSafeFactory)} target="_blank" rel="noopener noreferrer" className="text-primary">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">AgentProposalBoard</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs">{CONTRACTS.AgentProposalBoard}</code>
                <a href={explorerAddressUrl(CONTRACTS.AgentProposalBoard)} target="_blank" rel="noopener noreferrer" className="text-primary">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Explorer</span>
              <a href={NETWORK.explorerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary">
                {NETWORK.explorerUrl} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Security Model</h2>
          <div className="glass-card p-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>• <strong className="text-foreground">AI has no custody.</strong> The AI only generates proposal data. It cannot execute transactions.</p>
            <p>• <strong className="text-foreground">Smart contracts enforce policy.</strong> Every execution is checked against the vault's policy onchain.</p>
            <p>• <strong className="text-foreground">Owner controls everything.</strong> Only the vault owner can approve, reject, execute, and update policies.</p>
            <p>• <strong className="text-foreground">Operators are limited.</strong> Operators can only submit proposals and view data.</p>
            <p>• <strong className="text-foreground">Proposals expire.</strong> Proposals have an expiry time and cannot be executed after expiration.</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
