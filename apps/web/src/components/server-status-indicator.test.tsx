import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("ServerStatusIndicator", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SERVER_URL", "http://localhost:4000");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("shows checking state before the request resolves", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>(() => {
            return undefined;
          }),
      ),
    );

    const { ServerStatusIndicator } = await import("./server-status-indicator");

    render(<ServerStatusIndicator />);

    expect(screen.getByText("Checking server status")).toBeInTheDocument();
  });

  it("shows server online for a valid status response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok" }),
      }),
    );

    const { ServerStatusIndicator } = await import("./server-status-indicator");

    render(<ServerStatusIndicator />);

    await waitFor(() => {
      expect(screen.getByText("Server online")).toBeInTheDocument();
    });
  });

  it("shows server unavailable for invalid or failed responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "down" }),
      }),
    );

    const { ServerStatusIndicator } = await import("./server-status-indicator");

    render(<ServerStatusIndicator />);

    await waitFor(() => {
      expect(screen.getByText("Server unavailable")).toBeInTheDocument();
    });
  });
});
