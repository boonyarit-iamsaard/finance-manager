import { describe, expect, it } from "vitest";

import { loginSchema } from "./login";

describe("loginSchema", () => {
  it("accepts valid values", () => {
    expect(
      loginSchema.safeParse({
        email: "user@example.com",
        password: "password123",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid values with current messages", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "Invalid email address",
      "Password must be at least 8 characters",
    ]);
  });
});
