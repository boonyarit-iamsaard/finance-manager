import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:4000/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/get-session") {
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: "null",
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 404,
      body: JSON.stringify({ error: "Unhandled test route" }),
    });
  });
});

test("home page renders the current public call to action", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Finance Manager" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Get Started" }).click();
  await expect(page).toHaveURL(/\/signup$/);
});

test("auth pages link to each other", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByText("Log in to your account", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(
    page.getByText("Create an account", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("unauthenticated dashboard access redirects to login", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByText("Log in to your account", { exact: true }),
  ).toBeVisible();
});
