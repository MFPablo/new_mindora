import { redirect } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export async function requireAuth({
  queryClient,
  role,
}: {
  queryClient: QueryClient;
  role?: "patient" | "professional" | ("patient" | "professional")[];
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

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(session.user.role)) {
      throw redirect({
        to: "/access-denied",
      });
    }
  }

  return session;
}


export function getHomeDashboard(user?: { role: string; onboardingStep?: number }) {
  if (!user) return "/dashboard/patient";
  if (user.role === "professional") {
    // If onboarding is not complete, they go to onboarding, but for general dashboard redirect:
    return "/dashboard/professional";
  }
  return "/dashboard/patient";
}

export async function redirectIfAuth({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  const session = await queryClient.fetchQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/auth/session`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  if (session?.user) {
    if (session.user.role === "professional" && session.user.onboardingStep < 3) {
      throw redirect({ to: "/onboarding/step-1" });
    }
    throw redirect({
      to: getHomeDashboard(session.user),
    });
  }

  return null;
}
