import { useNavigate, getRouteApi, createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { z } from "zod";

export const Route = createFileRoute("/onboarding/step-3")({
  validateSearch: (search: Record<string, unknown>) => {
    return z.object({
      plan: z.string().optional(),
    }).parse(search);
  },
  component: OnboardingStep3,
});

const routeApi = getRouteApi("/onboarding/step-3");

function OnboardingStep3() {
  const { plan } = routeApi.useSearch();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

  const {
    register,
    handleSubmit,
    watch,
  } = useForm({
    defaultValues: {
      plan: plan || "professional_yearly",
      promoKey: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
      holderName: "",
    },
  });

  const selectedPlan = watch("plan");
  const isYearly = selectedPlan === "professional_yearly";
  const planName = isYearly ? "Plan Anual" : "Plan Mensual";
  const planPrice = isYearly ? "$290.00" : "$29.00";

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${SERVER_URL}/api/onboarding/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoKey: data.promoKey,
          plan: data.plan,
        }),
        credentials: "include",
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Error al activar la suscripción");
      return resData;
    },
    onSuccess: () => {
      window.location.href = "/dashboard/professional";
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const promoKey = watch("promoKey");

  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow w-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[580px] flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Activación de Cuenta</h1>
              <span className="text-sm font-semibold text-blue-600">Paso 3 de 3</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-full rounded-full"></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Método de Pago
              </h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm">
                Ingresa los datos de tu tarjeta para activar tu suscripción profesional.
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-slate-900 dark:text-white text-sm font-medium">Número de tarjeta</span>
                  <div className="relative flex w-full items-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 overflow-hidden transition-all group">
                    <div className="pl-4 text-slate-500 group-focus-within:text-blue-600 transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined">credit_card</span>
                    </div>
                    <input
                      className="w-full h-11 bg-transparent px-3 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm font-medium"
                      placeholder="0000 0000 0000 0000"
                      {...register("cardNumber")}
                      type="text"
                    />
                    <div className="pr-4 flex gap-2 opacity-50 grayscale">
                      <span className="text-[10px] font-bold border border-slate-400 rounded px-1 text-slate-500">VISA</span>
                      <span className="text-[10px] font-bold border border-slate-400 rounded px-1 text-slate-500">MC</span>
                    </div>
                  </div>
                </label>

                <div className="flex gap-4">
                  <label className="flex flex-col gap-1.5 flex-1">
                    <span className="text-slate-900 dark:text-white text-sm font-medium">Vencimiento</span>
                    <div className="relative flex w-full items-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 overflow-hidden transition-all">
                      <input
                        className="w-full h-11 bg-transparent px-4 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm font-medium"
                        placeholder="MM/AA"
                        {...register("expiry")}
                        type="text"
                      />
                    </div>
                  </label>
                  <label className="flex flex-col gap-1.5 flex-1">
                    <span className="text-slate-900 dark:text-white text-sm font-medium">CVC</span>
                    <div className="relative flex w-full items-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 overflow-hidden transition-all group">
                      <div className="pl-4 text-slate-500 group-focus-within:text-blue-600 transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                      </div>
                      <input
                        className="w-full h-11 bg-transparent px-3 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm font-medium"
                        maxLength={4}
                        placeholder="123"
                        {...register("cvc")}
                        type="password"
                      />
                    </div>
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-slate-900 dark:text-white text-sm font-medium">Nombre en la tarjeta</span>
                  <div className="relative flex w-full items-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 overflow-hidden transition-all">
                    <input
                      className="w-full h-11 bg-transparent px-4 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm font-medium"
                      placeholder="Como aparece en la tarjeta"
                      {...register("holderName")}
                      type="text"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-slate-900 dark:text-white text-sm font-medium">Código de Regalo / Descuento</span>
                  <div className="relative flex w-full items-center rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600 overflow-hidden transition-all">
                    <div className="pl-4 text-green-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">redeem</span>
                    </div>
                    <input
                      className="w-full h-11 bg-transparent px-3 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm font-medium uppercase"
                      placeholder="INGRESAR CÓDIGO"
                      {...register("promoKey")}
                      type="text"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 shrink-0">
                    <span className="material-symbols-outlined text-sm">diamond</span>
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold text-sm">Suscripción Profesional</h3>
                    <p className="text-slate-500 dark:text-gray-400 text-xs">{planName} con acceso completo</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-white font-semibold text-sm">Total a pagar</span>
                  <div className="text-right">
                    <span className="text-blue-600 font-bold text-lg">{planPrice}</span>
                    {promoKey && <p className="text-[10px] text-green-600 font-semibold tracking-tight">CÓDIGO APLICADO</p>}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-3 items-start">
                  <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">info</span>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed italic">
                    Como profesional en Mindora, conservarás todas tus funciones de paciente, permitiéndote agendar citas con otros profesionales.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center mt-1">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xs">lock</span>
                <p className="text-xs text-slate-500 dark:text-gray-400">Pagos encriptados con SSL de 256 bits.</p>
              </div>

              {mutation.isError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                  {(mutation.error as any).message}
                </div>
              )}

              <div className="pt-2">
                <button
                  className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-base font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                  type="submit"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Procesando..." : "Activar Suscripción Pro"}
                </button>
                <p className="text-center text-xs text-slate-500 mt-3">Al confirmar, aceptas nuestros <a className="underline hover:text-blue-600" href="#">Términos de Servicio</a>.</p>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
