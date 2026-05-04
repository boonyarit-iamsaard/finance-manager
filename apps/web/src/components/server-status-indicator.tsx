import { env } from "@finance-manager/env/web";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

type ServerStatus = "checking" | "online" | "unavailable";

interface ServerStatusResponse {
  status: "ok";
}

const serverStatusSchema: z.ZodType<ServerStatusResponse> = z.object({
  status: z.literal("ok"),
});

export function ServerStatusIndicator() {
  const [status, setStatus] = useState<ServerStatus>("checking");

  useEffect(() => {
    let isMounted = true;

    async function checkServerStatus() {
      try {
        const response = await fetch(new URL("/status", env.VITE_SERVER_URL), {
          headers: {
            accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Unexpected status ${response.status}`);
        }

        const payload = serverStatusSchema.safeParse(await response.json());

        if (!isMounted || !payload.success) {
          throw new Error("Invalid status response");
        }

        setStatus("online");
      } catch {
        if (isMounted) {
          setStatus("unavailable");
        }
      }
    }

    void checkServerStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div
        aria-live="polite"
        className="inline-flex items-center gap-2 text-muted-foreground text-sm"
        role="status"
      >
        <Loader2 className="size-4 animate-spin" />
        <span>Checking server status</span>
      </div>
    );
  }

  if (status === "online") {
    return (
      <div
        aria-live="polite"
        className="inline-flex items-center gap-2 text-emerald-600 text-sm"
        role="status"
      >
        <CircleCheck className="size-4" />
        <span>Server online</span>
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className="inline-flex items-center gap-2 text-muted-foreground text-sm"
      role="status"
    >
      <CircleAlert className="size-4" />
      <span>Server unavailable</span>
    </div>
  );
}
