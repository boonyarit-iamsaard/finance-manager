import { createFileRoute } from "@tanstack/react-router";

import { SignupForm } from "@/features/auth/components/signup-form";

export const Route = createFileRoute("/_auth/signup")({
  component: SignupPage,
});

function SignupPage() {
  return <SignupForm />;
}
