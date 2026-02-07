import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Plane,
  ArrowRight,
  MessageSquare,
  Search,
  LayoutDashboard,
  BellRing,
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
    description: "Hundreds of flights, hotels, and combos evaluated in seconds.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard updates live",
    description: "Watch your mission control as the agent narrows down the best options.",
  },
  {
    icon: BellRing,
    title: "You get smart alerts",
    description: "Price drops and new deals — delivered the moment they matter.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative text-center px-6 space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Plane className="h-6 w-6 text-primary" />
          </div>
          <span className="text-3xl font-bold tracking-tight">TripMaster</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-2xl mx-auto">
          Let us plan the
          <br />
          <span className="text-gradient-primary">perfect trip</span> for you
        </h1>

        {/* CTA */}
        <div className="pt-4">
          <Link to="/dashboard">
            <Button variant="hero" size="lg" className="text-base px-10 py-6 rounded-xl">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-xl bg-card/60 border border-border/30 p-4 text-left space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
