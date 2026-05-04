import { Button } from "@finance-manager/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@finance-manager/ui/components/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@finance-manager/ui/components/field";
import { Input } from "@finance-manager/ui/components/input";
import { Link } from "@tanstack/react-router";

import Loader from "@/components/loader";
import { useSignupForm } from "../hooks/use-signup-form";
import { FieldErrors } from "./field-errors";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const {
    clearValidationError,
    form,
    handleSubmit,
    isPending,
    validationErrors,
  } = useSignupForm();

  if (isPending) {
    return <Loader />;
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }}
        >
          <FieldGroup>
            <Field>
              <form.Field name="name">
                {(field) => (
                  <>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="John Doe"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        clearValidationError(field.name);
                        field.handleChange(e.target.value);
                      }}
                    />
                  </>
                )}
              </form.Field>
              <FieldErrors errors={validationErrors.name ?? []} />
            </Field>
            <Field>
              <form.Field name="email">
                {(field) => (
                  <>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="m@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        clearValidationError(field.name);
                        field.handleChange(e.target.value);
                      }}
                    />
                  </>
                )}
              </form.Field>
              <FieldErrors errors={validationErrors.email ?? []} />
            </Field>
            <Field>
              <form.Field name="password">
                {(field) => (
                  <>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        clearValidationError(field.name);
                        field.handleChange(e.target.value);
                      }}
                    />
                  </>
                )}
              </form.Field>
              <FieldErrors errors={validationErrors.password ?? []} />
            </Field>
            <Field>
              <form.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                })}
              >
                {({ canSubmit, isSubmitting }) => (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? "Creating account..." : "Sign up"}
                  </Button>
                )}
              </form.Subscribe>
              <p className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Log in
                </Link>
              </p>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
