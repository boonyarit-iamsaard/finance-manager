import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { type LoginFormValues, loginSchema } from "../validators/login";

type LoginValidationErrors = Partial<Record<keyof LoginFormValues, string[]>>;

function getLoginValidationErrors(value: LoginFormValues) {
  const result = loginSchema.safeParse(value);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<LoginValidationErrors>((errors, issue) => {
    const field = issue.path[0];

    if (field === "email" || field === "password") {
      errors[field] = [...(errors[field] ?? []), issue.message];
    }

    return errors;
  }, {});
}

export function useLoginForm() {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();
  const [validationErrors, setValidationErrors] =
    React.useState<LoginValidationErrors>({});

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setValidationErrors({});

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

  function handleSubmit() {
    const errors = getLoginValidationErrors(form.state.values);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    void form.handleSubmit();
  }

  function clearValidationError(field: keyof LoginFormValues) {
    setValidationErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  return {
    clearValidationError,
    form,
    handleSubmit,
    isPending,
    validationErrors,
  };
}
