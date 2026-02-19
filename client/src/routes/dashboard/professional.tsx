import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ProfessionalHome } from "@/components/ProfessionalHome";
import { ProfessionalAgenda } from "@/components/ProfessionalAgenda";

import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/dashboard/professional")({
  beforeLoad: ({ context }) => requireAuth({ queryClient: context.queryClient, role: "professional" }),
  component: ProfessionalDashboard,
});

import { SERVER_URL } from "@/lib/api";

function ProfessionalDashboard() {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<'home' | 'agenda'>('home');

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/auth/session`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: profileSettings } = useQuery({
    queryKey: ["profile-settings"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/profile`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const togglePrivacy = useMutation({
    mutationFn: async (isPublic: boolean) => {
      const res = await fetch(`${SERVER_URL}/api/professional/profile-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isProfilePublic: isPublic }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-settings"] });
    },
  });

  const user = session?.user;
  const profile = profileSettings?.user;

  // Profile enablement checks
  const hasName = !!profile?.name;
  const hasSpecialty = !!user?.specialty;
  const hasLicense = !!profile?.licenseNumber;
  const hasWorkingHours = !!user?.workingHours;
  const isProfileEnabled = hasName && hasSpecialty && hasLicense && hasWorkingHours;

  const [privacyLocal, setPrivacyLocal] = useState<boolean | null>(null);
  const isPublic = privacyLocal ?? profile?.isProfilePublic ?? true;

  const sidebarLinks = [
    { icon: "dashboard", label: "Dashboard", to: "/dashboard/professional", active: activeView === 'home', onClick: () => setActiveView('home') },
    { icon: "people", label: "Pacientes", to: "#" },
    { icon: "calendar_today", label: "Agenda", to: "#", active: activeView === 'agenda', onClick: () => setActiveView('agenda') },
    { icon: "chat_bubble_outline", label: "Mensajes", to: "#" },
    { icon: "description", label: "Documentos", to: "#" },
    ...(user?.id
      ? [
        {
          icon: "visibility",
          label: "Mi Perfil Público",
          to: `/professional/${user.id}`,
        },
      ]
      : []),
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-display text-slate-800 dark:text-slate-200 min-h-screen flex flex-col antialiased">
      <Navbar />
      <div className="flex-grow flex">
        <Sidebar
          links={sidebarLinks}
          user={user}
          userRoleLabel={user?.specialty || "Terapeuta"}
        />

        {activeView === 'home' ? (
          <ProfessionalHome
            user={user}
            isProfileEnabled={isProfileEnabled}
            hasName={hasName}
            hasSpecialty={hasSpecialty}
            hasLicense={hasLicense}
            hasWorkingHours={hasWorkingHours}
            isPublic={isPublic}
            onTogglePrivacy={(val) => {
              setPrivacyLocal(val);
              togglePrivacy.mutate(val);
            }}
          />
        ) : (
          <ProfessionalAgenda />
        )}
      </div>
      <Footer className="relative z-50 py-4" />
    </div >
  );
}
