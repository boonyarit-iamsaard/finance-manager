import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { loginSchema } from "../validators/login";

export function useLoginForm() {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(value, {
        onSuccess: () => {
          navigate({ to: "/dashboard" });
          toast.success("Logged in successfully");
        },
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      });
    },
  });

  return { form, isPending };
}
