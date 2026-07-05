import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/tollgate/Nav";
import { Hero } from "@/components/tollgate/Hero";
import { WhatIs } from "@/components/tollgate/WhatIs";
import { Features } from "@/components/tollgate/Features";
import { CacheDemo } from "@/components/tollgate/CacheDemo";
import { RoutingFlow } from "@/components/tollgate/RoutingFlow";
import { Stats } from "@/components/tollgate/Stats";
import { Install } from "@/components/tollgate/Install";
import { SelfHosted } from "@/components/tollgate/SelfHosted";
import { Footer } from "@/components/tollgate/Footer";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-[color:var(--bg-base)] text-foreground">
      <Nav />
      <Hero />
      <WhatIs />
      <Features />
      <CacheDemo />
      <RoutingFlow />
      <Stats />
      <Install />
      <SelfHosted />
      <Footer />
    </main>
  );
}
