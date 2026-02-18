import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

function ProfilePage() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("personal");
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
    <div className="min-h-screen bg-background-light font-display">
      <main className="w-full max-w-[1440px] mx-auto px-6 py-8 md:px-10 md:py-10">
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
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === item.id
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
            <PersonalInfoSection user={data.user} fileInputRef={fileInputRef} queryClient={queryClient} />
            <SecuritySection />
          </div>
        </div>
      </main>
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
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${SERVER_URL}/api/profile/upload-avatar`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al subir imagen");
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      setAvatarUrl(data.url);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const handleDeleteAvatar = async () => {
    await fetch(`${SERVER_URL}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${firstName} ${lastName}`.trim() }),
      credentials: "include",
    });
    setAvatarUrl("");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
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
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? (
              <div
                className="size-24 rounded-full bg-center bg-cover border-4 border-white shadow-md"
                style={{ backgroundImage: `url("${avatarUrl}")` }}
              />
            ) : (
              <div className="size-24 rounded-full border-4 border-white shadow-md bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                {firstName.charAt(0) || "U"}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white">photo_camera</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
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
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-primary-light rounded-lg hover:bg-blue-600/20 transition-colors disabled:opacity-50"
              >
                {uploadMutation.isPending ? "Subiendo..." : "Subir nueva"}
              </button>
              {avatarUrl && (
                <button
                  onClick={handleDeleteAvatar}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="nombre">
              Nombre
            </label>
            <input
              className="w-full rounded-lg border border-border-color bg-background-light px-3 py-2.5 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm"
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
              className="w-full rounded-lg border border-border-color bg-background-light px-3 py-2.5 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm"
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
              className="w-full rounded-lg border border-border-color bg-background-light px-3 py-2.5 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm"
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
              className="w-full rounded-lg border border-border-color bg-background-light px-3 py-2.5 text-text-main focus:border-blue-600 focus:ring-blue-600 shadow-sm"
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
            <span className="text-green-600 text-sm font-medium mr-4 self-center">✓ Cambios guardados</span>
          )}
          {saveStatus === "error" && (
            <span className="text-red-600 text-sm font-medium mr-4 self-center">Error al guardar</span>
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
            className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
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
