import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Vote, Lock, Zap, Users } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const FEATURES = [
  {
    icon: Shield,
    title: "Team Vaults",
    description: "Create secure multi-operator vaults for your team's treasury.",
  },
  {
    icon: Vote,
    title: "Proposal System",
    description: "AI-assisted proposals with owner approval before execution.",
  },
  {
    icon: Lock,
    title: "Policy Enforcement",
    description: "Smart contracts enforce spending limits and allowed recipients.",
  },
  {
    icon: Zap,
    title: "AI Assistance",
    description: "AI proposes actions. You stay in control. Contracts enforce rules.",
  },
];

export default function Landing() {
  const { isConnected, connect } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border/30">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-lg font-semibold">Agent Safe</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/docs">
              <Button variant="ghost" size="sm">Docs</Button>
            </Link>
            {isConnected ? (
              <Link to="/app">
                <Button size="sm" className="gap-2">
                  Launch App <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <Button size="sm" onClick={connect}>Connect Wallet</Button>
            )}
          </div>
        </div>
      </header>

      <section className="container py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 border border-primary/20">
            <Shield className="h-3.5 w-3.5" />
            Built on Etherlink
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            AI-Assisted Treasury
            <span className="block gradient-text mt-1">With Full Control</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Let AI help prepare onchain actions for your team — without giving it custody of your funds. 
            Smart contracts enforce every policy.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            {isConnected ? (
              <Link to="/app">
                <Button size="lg" className="gap-2 px-8">
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={connect} className="gap-2 px-8">
                Connect Wallet <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Link to="/docs">
              <Button variant="outline" size="lg" className="px-8">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass-card-hover p-6 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/30 py-24">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
            {[
              { step: "1", title: "Create a Vault", desc: "Owner creates a team vault with policy rules." },
              { step: "2", title: "Propose Actions", desc: "Operators or AI propose transfers and calls." },
              { step: "3", title: "Approve & Execute", desc: "Owner reviews, approves, and executes onchain." },
            ].map((s, i) => (
              <div key={s.step} className="text-center animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg mx-auto mb-4 border border-primary/20">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/30 py-8">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Etherlink Agent Safe</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <a href="https://shadownet.explorer.etherlink.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              Explorer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
