import { createFileRoute, useNavigate, getRouteApi } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { z } from "zod";

import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/onboarding/step-2")({
  beforeLoad: ({ context }) => requireAuth({ queryClient: context.queryClient }),
  validateSearch: (search: Record<string, unknown>) => {
    return z.object({
      plan: z.string().optional(),
    }).parse(search);
  },
  component: OnboardingStep2,
});

const routeApi = getRouteApi("/onboarding/step-2");

function OnboardingStep2() {
  const navigate = useNavigate();
  const { plan } = routeApi.useSearch();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

  const {
    register,
    handleSubmit,
    watch,
  } = useForm({
    defaultValues: {
      duration: "45",
      startTime: "09:00",
      endTime: "18:00",
      days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      specialty: "Psicólogo Clínico",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${SERVER_URL}/api/onboarding/agenda`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Error al guardar la agenda");
      return resData;
    },
    onSuccess: () => {
      navigate({ to: "/onboarding/step-3", search: { plan } as any });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const handleSkip = () => {
    navigate({ to: "/onboarding/step-3" });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:py-12">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col relative">
          <div className="px-8 pt-8 pb-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Paso 2 de 3</span>
              <span className="text-xs text-slate-500 dark:text-gray-400">66% completado</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-2/3 rounded-full"></div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Configura tus horarios</h1>
              <p className="text-slate-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">Define la duración de tus sesiones y tu disponibilidad general para que tus clientes puedan reservar.</p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <span className="material-symbols-outlined text-blue-600 text-lg">timer</span>
                  Duración de la sesión <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["30", "45", "60", "90"].map((d) => (
                    <label key={d} className="cursor-pointer group">
                      <input
                        className="peer sr-only"
                        type="radio"
                        value={d}
                        {...register("duration")}
                      />
                      <div className="px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 hover:border-blue-600/50 peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 peer-checked:text-blue-600 transition-all text-center text-sm font-medium shadow-sm group-hover:shadow-md">
                        {d} min
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-gray-700"></div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <span className="material-symbols-outlined text-blue-600 text-lg">schedule</span>
                    Horario General
                  </label>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-gray-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 block tracking-wider">Inicio</label>
                    <input
                      className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-semibold focus:ring-0 text-base"
                      type="time"
                      {...register("startTime")}
                    />
                  </div>
                  <span className="text-slate-300 dark:text-gray-600 text-xl font-light">|</span>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 block tracking-wider">Fin</label>
                    <input
                      className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-semibold focus:ring-0 text-base"
                      type="time"
                      {...register("endTime")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900 dark:text-white block">Días disponibles</label>
                <div className="grid gap-2">
                  {[
                    { id: "monday", label: "Lunes" },
                    { id: "tuesday", label: "Martes" },
                    { id: "wednesday", label: "Miércoles" },
                    { id: "thursday", label: "Jueves" },
                    { id: "friday", label: "Viernes" },
                    { id: "saturday", label: "Sábado" },
                    { id: "sunday", label: "Domingo" },
                  ].map((day) => (
                    <div key={day.id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-slate-100 dark:border-slate-700 hover:border-blue-600/30 transition-all shadow-sm">
                      <div className="flex items-center h-5 pl-1">
                        <input
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600 focus:ring-2"
                          type="checkbox"
                          {...register(`days.${day.id}` as any)}
                        />
                      </div>
                      <span className={`text-sm font-medium w-24 ${watch(`days.${day.id}` as any) ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                        {day.label}
                      </span>
                      {watch(`days.${day.id}` as any) ? (
                        <div className="ml-auto bg-slate-50 dark:bg-gray-700/50 px-3 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-gray-300 border border-slate-100 dark:border-gray-700">
                          {watch("startTime")} - {watch("endTime")}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 ml-auto italic">No disponible</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] mb-4 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {mutation.isPending ? "Guardando..." : "Guardar y Continuar"}
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-medium py-2 text-sm transition-colors text-center"
                >
                  Saltar por ahora
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
