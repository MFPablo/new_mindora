import { createFileRoute } from "@tanstack/react-router";
import { AccessDenied } from "@/components/AccessDenied";

export const Route = createFileRoute("/access-denied")({
  component: AccessDenied,
});
