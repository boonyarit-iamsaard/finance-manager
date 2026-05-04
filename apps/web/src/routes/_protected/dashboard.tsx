import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { session } = Route.useRouteContext();

  return (
    <div className="p-6">
      <h1 className="font-bold text-2xl">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome, {session.data?.user.name}
      </p>
    </div>
  );
}
