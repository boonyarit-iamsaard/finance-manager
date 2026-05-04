import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { type SignupFormValues, signupSchema } from "../validators/signup";

type SignupValidationErrors = Partial<Record<keyof SignupFormValues, string[]>>;

function getSignupValidationErrors(value: SignupFormValues) {
  const result = signupSchema.safeParse(value);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<SignupValidationErrors>((errors, issue) => {
    const field = issue.path[0];

    if (field === "email" || field === "name" || field === "password") {
      errors[field] = [...(errors[field] ?? []), issue.message];
    }

    return errors;
  }, {});
}

export function useSignupForm() {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();
  const [validationErrors, setValidationErrors] =
    React.useState<SignupValidationErrors>({});

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
      setValidationErrors({});

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

  async function handleSubmit() {
    const errors = getSignupValidationErrors(form.state.values);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    await form.handleSubmit();
  }

  function clearValidationError(field: keyof SignupFormValues) {
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
