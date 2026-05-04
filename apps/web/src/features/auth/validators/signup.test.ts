import { describe, expect, it } from "vitest";

import { signupSchema } from "./signup";

describe("signupSchema", () => {
  it("accepts valid values", () => {
    expect(
      signupSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid values with current messages", () => {
    const result = signupSchema.safeParse({
      name: "J",
      email: "not-an-email",
      password: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "Name must be at least 2 characters",
      "Invalid email address",
      "Password must be at least 8 characters",
    ]);
  });
});
