import { redirect } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export async function requireAuth({
  queryClient,
  role,
}: {
  queryClient: QueryClient;
  role?: "patient" | "professional";
}) {
  const session = await queryClient.fetchQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/auth/session`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (!session?.user) {
    throw redirect({
      to: "/login",
      search: {
        redirect: window.location.pathname,
      },
    });
  }

  if (role && session.user.role !== role) {
    throw redirect({
      to: "/access-denied",
    });
  }

  return session;
}
