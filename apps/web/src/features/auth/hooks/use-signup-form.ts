import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { signupSchema } from "../validators/signup";

export function useSignupForm() {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(value, {
        onSuccess: () => {
          navigate({ to: "/dashboard" });
          toast.success("Account created successfully");
        },
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      });
    },
  });

  return { form, isPending };
}
