import { Button } from "@finance-manager/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ServerStatusIndicator } from "@/components/server-status-indicator";

export const Route = createFileRoute("/_public/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-6">
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-4xl tracking-tight">Finance Manager</h1>
        <p className="max-w-sm text-lg text-muted-foreground">
          Take control of your personal finances. Track spending, set budgets,
          and reach your goals.
        </p>
      </div>
      <ServerStatusIndicator />
      <Button size="lg" render={<Link to="/signup" />}>
        Get Started
      </Button>
    </div>
  );
}
