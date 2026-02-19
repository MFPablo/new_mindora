import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import { z } from "zod";

import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ context }) => requireAuth({ queryClient: context.queryClient }),
  validateSearch: (search: Record<string, unknown>) => {
    return z.object({
      section: z.string().optional(),
    }).parse(search);
  },
  component: ProfilePage,
});

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const routeApi = getRouteApi("/profile");

function ProfilePage() {
  const { section } = routeApi.useSearch();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState(section || "personal");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/profile`, { credentials: "include" });
      if (!res.ok) throw new Error("No autenticado");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-text-secondary text-lg">Cargando perfil...</div>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-text-main">No has iniciado sesión</h1>
        <Link to="/login" className="text-blue-600 hover:underline font-medium">Iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light font-display flex flex-col">
      <Navbar />
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8 md:px-10 md:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-text-main text-3xl font-black tracking-tight">Mi Perfil</h1>
          <p className="text-text-secondary text-base mt-2">
            Gestiona tu información personal y la seguridad de tu cuenta.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <nav className="flex flex-col gap-1 sticky top-28">
              {[
                { id: "personal", icon: "badge", label: "Información Personal" },
                { id: "security", icon: "lock", label: "Seguridad" },
                { id: "notifications", icon: "notifications", label: "Notificaciones" },
                { id: "billing", icon: "credit_card", label: "Pagos y Facturación" },
                { id: "promo", icon: "redeem", label: "Códigos Promocionales" },
                ...(data.user.role !== "professional" ? [{ id: "upgrade", icon: "workspace_premium", label: "Mindora Pro" }] : []),
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === item.id
                    ? "bg-blue-600/10 text-blue-600 font-bold"
                    : "text-text-secondary font-medium hover:bg-white hover:text-text-main"
                    }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            <div id="personal">
              <PersonalInfoSection user={data.user} fileInputRef={fileInputRef} queryClient={queryClient} />
            </div>
            {data.user.role !== "professional" && (
              <div id="upgrade">
                <UpgradeSection />
              </div>
            )}
            <div id="security">
              <SecuritySection />
            </div>
            <div id="billing">
              <BillingSection user={data.user} />
            </div>
            <div id="promo">
              <PromoCodeSection />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- Personal Info Section ---
function PersonalInfoSection({
  user,
  fileInputRef,
  queryClient,
}: {
  user: { id: string; name: string | null; email: string; phone: string | null; image: string | null; role: string };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const nameParts = (user.name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user.image || "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al guardar");
      return res.json();
    },
    onSuccess: () => {
      setSaveStatus("saved");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => setSaveStatus("error"),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log("Starting upload of:", file.name);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${SERVER_URL}/api/profile/upload-avatar`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Upload response error:", errorData);
        throw new Error(errorData.message || "Error al subir imagen");
      }
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      console.log("Upload successful, new URL:", data.url);
      setAvatarUrl(data.url);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (err: any) => {
      console.error("Mutation error observer:", err.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File detected in input:", file.name, file.size);
      uploadMutation.mutate(file);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await fetch(`${SERVER_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${firstName} ${lastName}`.trim(), image: null }),
        credentials: "include",
      });
      setAvatarUrl("");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (error) {
      console.error("Delete avatar error:", error);
    }
  };

  return (
    <div id="personal" className="bg-surface-light border border-border-color rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border-color flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-bold text-text-main">Información Personal</h2>
      </div>
      <div className="p-6 md:p-8">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div
            className="relative group cursor-pointer"
            onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
          >
            {avatarUrl ? (
              <div
                className={`size-24 rounded-full bg-center bg-cover border-4 border-white shadow-md transition-all ${uploadMutation.isPending ? "opacity-30 scale-95" : "group-hover:scale-105"}`}
                style={{ backgroundImage: `url("${avatarUrl}")` }}
              />
            ) : (
              <div className={`size-24 rounded-full border-4 border-white shadow-md bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 transition-all ${uploadMutation.isPending ? "opacity-30 scale-95" : "group-hover:bg-blue-200"}`}>
                {firstName.charAt(0) || "U"}
              </div>
            )}

            {/* Spinner Overlay */}
            {uploadMutation.isPending && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!uploadMutation.isPending && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            key={avatarUrl} // Reset input on change
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-text-main">Tu Foto de Perfil</h3>
            <p className="text-sm text-text-secondary mb-3">Esta foto será visible para tus terapeutas.</p>
            <div className="flex gap-3 justify-center sm:justify-start">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {uploadMutation.isPending ? "Subiendo..." : "Subir nueva"}
              </button>
              {avatarUrl && (
                <button
                  onClick={handleDeleteAvatar}
                  disabled={uploadMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Eliminar
                </button>
              )}
            </div>
            {uploadMutation.isError && (
              <p className="text-xs text-red-600 mt-2 font-medium bg-red-50 p-2 rounded border border-red-100 animate-fade-in">
                Error: {(uploadMutation.error as Error)?.message}
              </p>
            )}
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="nombre">
              Nombre
            </label>
            <input
              className="w-full rounded-lg border border-border-color bg-background-light px-3 py-2.5 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm transition-all"
              id="nombre"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="apellido">
              Apellido
            </label>
            <input
              className="w-full rounded-lg border border-border-color bg-background-light px-3 py-2.5 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm transition-all"
              id="apellido"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="profile-email">
              Email
            </label>
            <input
              className="w-full rounded-lg border border-border-color bg-background-light px-3 py-2.5 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm transition-all"
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="telefono">
              Teléfono
            </label>
            <input
              className="w-full rounded-lg border border-border-color bg-background-light px-3 py-2.5 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm transition-all"
              id="telefono"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 11 1234 5678"
            />
          </div>
        </div>

        {/* Save */}
        <div className="mt-8 flex justify-end pt-6 border-t border-border-color">
          {saveStatus === "saved" && (
            <span className="text-green-600 text-sm font-medium mr-4 self-center anim-fade-in">✓ Cambios guardados</span>
          )}
          {saveStatus === "error" && (
            <span className="text-red-600 text-sm font-medium mr-4 self-center anim-fade-in">Error al guardar</span>
          )}
          <button
            onClick={() => {
              setSaveStatus("saving");
              saveMutation.mutate();
            }}
            disabled={saveMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saveMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Security Section ---
function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }
      const res = await fetch(`${SERVER_URL}/api/profile/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cambiar contraseña");
      return data;
    },
    onSuccess: () => {
      setStatus({ type: "success", message: "Contraseña actualizada exitosamente" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setStatus(null), 3000);
    },
    onError: (err: Error) => {
      setStatus({ type: "error", message: err.message });
    },
  });

  return (
    <div id="security" className="bg-surface-light border border-border-color rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border-color flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-bold text-text-main">Seguridad</h2>
      </div>
      <div className="p-6 md:p-8">
        <h3 className="text-base font-bold text-text-main mb-4">Cambiar Contraseña</h3>

        {status && (
          <div
            className={`mb-4 p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${status.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
              }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {status.type === "success" ? "check_circle" : "error"}
            </span>
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="current-password">
              Contraseña Actual
            </label>
            <input
              className="w-full rounded-lg border border-border-color bg-background-light px-3 py-2.5 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm"
              id="current-password"
              placeholder="••••••••"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="new-password">
              Nueva Contraseña
            </label>
            <input
              className="w-full rounded-lg border border-border-color bg-background-light px-3 py-2.5 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm"
              id="new-password"
              placeholder="••••••••"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="confirm-password">
              Confirmar Nueva Contraseña
            </label>
            <input
              className="w-full rounded-lg border border-border-color bg-background-light px-3 py-2.5 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm"
              id="confirm-password"
              placeholder="••••••••"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end pt-6 border-t border-border-color">
          <button
            onClick={() => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setStatus(null);
            }}
            className="bg-white border border-border-color text-text-main font-medium py-2.5 px-6 rounded-lg hover:bg-gray-50 transition-colors mr-3"
          >
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !currentPassword || !newPassword || !confirmPassword}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {mutation.isPending ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Promo Code Section ---
function PromoCodeSection() {
  const queryClient = useQueryClient();
  const [promoCode, setPromoCode] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const mutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await fetch(`${SERVER_URL}/api/promo-key/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al canjear el código");
      return data;
    },
    onSuccess: (data) => {
      setStatus({ type: "success", message: data.message });
      setPromoCode("");
      // Invalidate both session (for potentially new features) and billing history
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      setTimeout(() => setStatus(null), 5000);
    },
    onError: (err: Error) => {
      setStatus({ type: "error", message: err.message });
    },
  });

  return (
    <div id="promo" className="bg-surface-light border border-border-color rounded-xl shadow-sm overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-border-color flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-bold text-text-main">Códigos Promocionales</h2>
      </div>
      <div className="p-6 md:p-8">
        <p className="text-sm text-text-secondary mb-6">
          Si tienes un código de descuento o una promoción, ingrésalo aquí para aplicarlo a tu cuenta.
        </p>

        {status && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium flex items-center gap-3 ${status.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
              }`}
          >
            <span className="material-symbols-outlined shrink-0 text-[18px]">
              {status.type === "success" ? "check_circle" : "error"}
            </span>
            {status.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
          <div className="flex-1">
            <input
              className="w-full rounded-lg border border-border-color bg-background-light px-4 py-3 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm uppercase placeholder:normal-case font-mono tracking-wider transition-all"
              placeholder="EJ: MINDORA2024"
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
          </div>
          <button
            onClick={() => mutation.mutate(promoCode)}
            disabled={mutation.isPending || !promoCode.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 whitespace-nowrap"
          >
            {mutation.isPending ? "Validando..." : "Canjear Código"}
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex gap-4 items-start shadow-inner">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">info</span>
          <div>
            <h4 className="text-sm font-bold text-text-main mb-1">Sobre las promociones</h4>
            <ul className="text-xs text-text-secondary space-y-1 list-disc pl-4">
              <li>Los códigos son de un solo uso por usuario.</li>
              <li>Asegúrate de que el código esté vigente antes de usarlo.</li>
              <li>Los beneficios se verán reflejados automáticamente en tu perfil o facturación.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingSection({ user }: { user: any }) {
  const isProfessional = user.role === "professional" || user.isProfessionalActive;

  const { data: billingData, isLoading } = useQuery({
    queryKey: ["billing"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/profile/billing`, { credentials: "include" });
      if (!res.ok) throw new Error("Error fetching billing data");
      const resJson = await res.json();
      return resJson.data;
    },
  });

  const mergedHistory = billingData
    ? [
      ...billingData.transactions.map((t: any) => ({
        id: t.id,
        date: new Date(t.createdAt),
        concept: t.concept || "Suscripción Mindora",
        status: t.status,
        amount: `$${t.amount.toFixed(2)}`,
        isPromo: t.amount === 0, // Mark as promo if $0
      })),
      ...billingData.promoRedemptions
        .filter((p: any) => {
          // Avoid duplication: filter out if there's already a transaction with this key in concept
          return !billingData.transactions.some((t: any) => t.concept?.includes(p.promoKey.key));
        })
        .map((p: any) => ({
          id: p.id,
          date: new Date(p.redeemedAt),
          concept: `Código: ${p.promoKey.key}`,
          status: "CANJEADO",
          amount: "GRATIS",
          isPromo: true,
        })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime())
    : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Pagos y Facturación</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm italic">Gestiona tus planes, facturas y métodos de pago.</p>
        </div>

        {/* Dynamic CTA - Only for non-professionals */}
        {!isProfessional && (
          <button
            onClick={() => window.location.href = "/onboarding/step-1"}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">rocket_launch</span>
            Hacerse Profesional
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-600">receipt_long</span>
            <h3 className="font-bold text-slate-900 dark:text-white">Facturas Recientes</h3>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="h-20 bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-2xl" />
            ) : mergedHistory.filter(i => !i.isPromo).slice(0, 3).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-600/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined text-lg italic">description</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Factura #MND-{item.id.slice(-4).toUpperCase()}</p>
                    <p className="text-[11px] text-slate-500">{item.date.toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">download</span>
                  PDF
                </button>
              </div>
            ))}
            {!isLoading && mergedHistory.filter(i => !i.isPromo).length === 0 && (
              <p className="text-xs text-slate-500 italic p-4 text-center">No hay facturas disponibles.</p>
            )}
          </div>
        </div>

        {/* Info Card / Status */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <h3 className="font-bold text-slate-900 dark:text-white">Estado de Cuenta</h3>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 min-h-[140px] flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isProfessional ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                <span className="material-symbols-outlined text-2xl">{isProfessional ? "verified" : "account_circle"}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isProfessional ? "Suscripción Profesional Activa" : "Cuenta de Paciente (Gratis)"}
                </p>
                <p className="text-xs text-slate-500">
                  {isProfessional ? "Tu próximo cobro será automático." : "Actualiza para obtener más funciones."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified History Table */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">history</span>
          <h3 className="font-bold text-slate-900 dark:text-white">Historial de Actividad</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Concepto</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 animate-pulse">Cargando historial...</td>
                </tr>
              ) : mergedHistory.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{item.date.toLocaleDateString()}</td>
                  <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">{item.concept}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.isPromo
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{item.amount}</td>
                </tr>
              ))}
              {!isLoading && mergedHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 italic">No hay actividad reciente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UpgradeSection() {
  return (
    <div id="upgrade" className="bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400 rounded-xl shadow-lg overflow-hidden text-white p-8 group relative">
      <div className="absolute top-0 right-0 p-8 opacity-10 transition-opacity group-hover:opacity-20">
        <span className="material-symbols-outlined text-[120px]">workspace_premium</span>
      </div>
      <div className="relative z-10 max-w-lg">
        <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined font-normal">medical_services</span>
          ¿Eres Profesional de la Salud?
        </h2>
        <p className="text-blue-50 text-base mb-6 leading-relaxed">
          Únete a la red más grande de profesionales y comienza a gestionar tus citas, pacientes e ingresos de manera automatizada.
        </p>
        <ul className="mb-8 space-y-3 text-sm font-medium">
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Gestión de Agenda Inteligente
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Fichas Clínicas Digitales
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Procesamiento de Pagos Automático
          </li>
        </ul>
        <Link
          to="/onboarding/step-1"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold py-3 px-8 rounded-lg shadow-xl shadow-blue-900/20 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
        >
          Empezar como Profesional
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
