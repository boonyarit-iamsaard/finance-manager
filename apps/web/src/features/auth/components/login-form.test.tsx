import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  sessionState: {
    data: null,
    isPending: false,
  },
  signInEmail: vi.fn(),
  signUpEmail: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    className,
    to,
  }: {
    children: ReactNode;
    className?: string;
    to: string;
  }) => (
    <a className={className} href={to}>
      {children}
    </a>
  ),
  useNavigate: () => mocks.navigate,
}));

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: mocks.signInEmail,
    },
    signUp: {
      email: mocks.signUpEmail,
    },
    useSession: () => mocks.sessionState,
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.signInEmail.mockReset();
    mocks.signUpEmail.mockReset();
    mocks.toastError.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.sessionState.data = null;
    mocks.sessionState.isPending = false;
  });

  it("renders the login form and signup link", () => {
    render(<LoginForm />);

    expect(screen.getByText("Log in to your account")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("shows the loading state while the session is pending", () => {
    mocks.sessionState.isPending = true;

    render(<LoginForm />);

    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Log in" }),
    ).not.toBeInTheDocument();
  });

  it("validates values before submitting", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Invalid email address")).toBeVisible();
    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeVisible();
    await waitFor(() => {
      expect(mocks.signInEmail).not.toHaveBeenCalled();
    });
  });

  it("submits values and handles success", async () => {
    const user = userEvent.setup();
    mocks.signInEmail.mockImplementation(async (_values, options) => {
      options.onSuccess();
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mocks.signInEmail).toHaveBeenCalledWith(
        {
          email: "user@example.com",
          password: "password123",
        },
        expect.objectContaining({
          onError: expect.any(Function),
          onSuccess: expect.any(Function),
        }),
      );
    });
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/dashboard" });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Logged in successfully");
  });
});
