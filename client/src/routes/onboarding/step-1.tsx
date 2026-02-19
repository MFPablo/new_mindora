import { createFileRoute, useNavigate, getRouteApi } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import { z } from "zod";

import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/onboarding/step-1")({
  beforeLoad: ({ context }) => requireAuth({ queryClient: context.queryClient }),
  validateSearch: (search: Record<string, unknown>) => {
    return z.object({
      plan: z.string().optional(),
    }).parse(search);
  },
  component: OnboardingStep1,
});

const routeApi = getRouteApi("/onboarding/step-1");

function OnboardingStep1() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { plan } = routeApi.useSearch();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/auth/session`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    staleTime: 5000,
  });

  // Set initial avatar if available
  if (session?.user?.image && !avatarUrl) {
    setAvatarUrl(session.user.image);
  }

  const {
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      phone: "",
      address: "",
      image: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${SERVER_URL}/api/onboarding/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al guardar el perfil");
      return res.json();
    },
    onSuccess: () => {
      navigate({ to: "/onboarding/step-2", search: { plan } as any });
    },
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
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al subir imagen");
      }
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      setAvatarUrl(data.url);
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const onSubmit = (data: any) => {
    mutation.mutate({ ...data, image: avatarUrl });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:py-12">
        <div className="w-full max-w-[580px]">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="px-8 pt-8 pb-4">
              <div className="flex justify-between items-center mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span>Paso 1 de 3</span>
                <span>33%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out" style={{ width: "33%" }}></div>
              </div>
            </div>

            <div className="px-8 sm:px-10 pb-10">
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {session?.user?.role === "patient" ? "Mejorar a Profesional" : "Configuración de cuenta"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Completa tu perfil profesional para comenzar a atender pacientes en Mindora.
                </p>
              </div>

              <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col items-center justify-center gap-4 py-2">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <div
                        className={`w-28 h-28 rounded-full bg-center bg-cover border-4 border-white dark:border-slate-700 shadow-xl transition-all ${uploadMutation.isPending ? "opacity-30 scale-95" : "group-hover:scale-105"}`}
                        style={{ backgroundImage: `url("${avatarUrl}")` }}
                      />
                    ) : (
                      <div className={`w-28 h-28 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 transition-all duration-300 overflow-hidden ${uploadMutation.isPending ? "opacity-30" : ""}`}>
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-blue-600 transition-colors">add_a_photo</span>
                      </div>
                    )}

                    {uploadMutation.isPending && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}

                    <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-white p-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-600 flex items-center justify-center group-hover:text-blue-600 transition-colors">
                      <span className="material-symbols-outlined text-base">edit</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Foto de perfil</p>
                    <button
                      className="text-xs text-blue-600 font-semibold hover:text-blue-700 mt-1 focus:outline-none"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarUrl ? "Cambiar imagen" : "Subir imagen"}
                    </button>
                    {uploadMutation.isError && (
                      <p className="text-[10px] text-red-600 mt-1 font-medium italic">
                        Error al subir
                      </p>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="phone">
                      Teléfono móvil
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <span className="material-symbols-outlined text-xl">call</span>
                      </div>
                      <input
                        className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm text-sm"
                        id="phone"
                        required
                        {...register("phone", { required: true })}
                        placeholder="+34 600 000 000"
                        type="tel"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="address">
                      Dirección profesional
                    </label>
                    <div className="relative group">
                      <div className="absolute top-3 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <span className="material-symbols-outlined text-xl">location_on</span>
                      </div>
                      <textarea
                        className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm resize-none text-sm"
                        id="address"
                        required
                        {...register("address", { required: true })}
                        placeholder="Calle Ejemplo 123, Oficina 4B, Madrid"
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    type="submit"
                    disabled={mutation.isPending}
                  >
                    <span>{mutation.isPending ? "Guardando..." : "Siguiente Paso"}</span>
                    <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
