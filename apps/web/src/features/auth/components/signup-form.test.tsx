import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignupForm } from "./signup-form";

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

describe("SignupForm", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.signInEmail.mockReset();
    mocks.signUpEmail.mockReset();
    mocks.toastError.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.sessionState.data = null;
    mocks.sessionState.isPending = false;
  });

  it("renders the signup form and login link", () => {
    render(<SignupForm />);

    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("validates values before submitting", async () => {
    const user = userEvent.setup();

    render(<SignupForm />);

    await user.type(screen.getByLabelText("Full Name"), "J");
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(
      await screen.findByText("Name must be at least 2 characters"),
    ).toBeVisible();
    expect(await screen.findByText("Invalid email address")).toBeVisible();
    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeVisible();
    await waitFor(() => {
      expect(mocks.signUpEmail).not.toHaveBeenCalled();
    });
  });

  it("submits values and handles success", async () => {
    const user = userEvent.setup();
    mocks.signUpEmail.mockImplementation(async (_values, options) => {
      options.onSuccess();
    });

    render(<SignupForm />);

    await user.type(screen.getByLabelText("Full Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => {
      expect(mocks.signUpEmail).toHaveBeenCalledWith(
        {
          email: "jane@example.com",
          name: "Jane Doe",
          password: "password123",
        },
        expect.objectContaining({
          onError: expect.any(Function),
          onSuccess: expect.any(Function),
        }),
      );
    });
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/dashboard" });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Account created successfully",
    );
  });
});
