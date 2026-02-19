import { requireAuth } from "@/lib/auth-guard";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardHome } from "@/components/DashboardHome";
import { SessionsCalendar } from "@/components/SessionsCalendar";
import { CrisisModal } from "@/components/CrisisModal";

export const Route = createFileRoute("/dashboard/patient")({
  beforeLoad: ({ context }) => requireAuth({ queryClient: context.queryClient, role: ["patient", "professional"] }),
  component: PatientDashboard,
});

import { SERVER_URL } from "@/lib/api";

function PatientDashboard() {
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'sessions'>('home');

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/auth/session`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["patient-dashboard"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/patient/dashboard`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });

  const user = session?.user;

  const sidebarLinks = [
    { icon: "dashboard", label: "Dashboard", to: "/dashboard/patient", active: activeView === 'home', onClick: () => setActiveView('home') },
    { icon: "groups", label: "Mis Profesionales", to: "#" },
    { icon: "calendar_month", label: "Mis Sesiones", to: "#", active: activeView === 'sessions', onClick: () => setActiveView('sessions') },
    { icon: "library_books", label: "Recursos", to: "#" },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-display text-slate-800 dark:text-slate-200 min-h-screen flex flex-col antialiased">
      <Navbar />
      <div className="flex-grow flex">
        <Sidebar
          links={sidebarLinks}
          user={user}
          userRoleLabel="Paciente"
        />

        {activeView === 'home' ? (
          <DashboardHome
            user={user}
            dashboard={dashboard}
            isLoading={isLoading}
            onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
            onViewSessions={() => setActiveView('sessions')}
          />
        ) : (
          <SessionsCalendar />
        )}
      </div>
      <Footer className="relative z-50 py-4" />

      <CrisisModal isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} />
    </div >
  );
}
