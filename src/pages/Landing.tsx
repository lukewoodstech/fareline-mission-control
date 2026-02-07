import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, ArrowRight } from "lucide-react";

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
      </div>
    </div>
  );
}
