import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Search,
  LayoutDashboard,
  BellRing,
  ArrowRight,
  Plane,
  Zap,
  Shield,
} from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "You text your trip",
    description: "Tell our agent where you're going, when, and your budget — all via SMS.",
  },
  {
    icon: Search,
    title: "Agent searches everything",
    description: "Hundreds of flights, hotels, and combos evaluated in seconds. No tabs, no stress.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard updates live",
    description: "Watch your mission control as the agent narrows down the best options in real time.",
  },
  {
    icon: BellRing,
    title: "You get smart alerts",
    description: "Price drops, new deals, expiring holds — delivered via SMS the moment they matter.",
  },
];

const features = [
  {
    icon: Plane,
    title: "847+ options scanned",
    description: "Per search, on average",
  },
  {
    icon: Zap,
    title: "3.5 hours saved",
    description: "Compared to manual booking",
  },
  {
    icon: Shield,
    title: "Budget-safe",
    description: "Never exceeds your limit",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Plane className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">Fareline</span>
          </div>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative container mx-auto px-4 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
            <Zap className="h-3 w-3" />
            <span>Your AI travel agent, always on duty</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            <span className="text-gradient-primary">Mission Control</span>
            <br />
            for your next trip
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Text us where you want to go. Our agent searches hundreds of flights and hotels,
            finds the best deals, and keeps watching — so you never miss a price drop.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button variant="hero" size="lg" className="text-base px-8 py-6 rounded-xl">
                Open Demo Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">No signup needed · Live mock data</p>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Fareline works</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From text message to booked trip — in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 z-10" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Plane className="h-3 w-3 text-primary" />
            <span>Fareline</span>
          </div>
          <span>Demo · Not a real product (yet)</span>
        </div>
      </footer>
    </div>
  );
}
