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
import { cn } from "@finance-manager/ui/lib/utils";
import { Link } from "@tanstack/react-router";

import Loader from "@/components/loader";
import { useLoginForm } from "../hooks/use-login-form";
import { FieldErrors } from "./field-errors";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    clearValidationError,
    form,
    handleSubmit,
    isPending,
    validationErrors,
  } = useLoginForm();

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Log in to your account</CardTitle>
          <CardDescription>
            Enter your email below to log in to your account
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
                      {isSubmitting ? "Logging in..." : "Log in"}
                    </Button>
                  )}
                </form.Subscribe>
                <p className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </p>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
