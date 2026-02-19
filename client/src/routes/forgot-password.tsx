import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
  } = useForm({
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
      const res = await fetch(`${serverUrl}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || "Error al enviar el correo");
      return responseData;
    },
  });

  const onSubmit = (data: { email: string }) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center items-center gap-2 mb-8">
            <div className="h-10 w-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 text-2xl">spa</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mindora</span>
          </div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recupera tu acceso
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Ingresa tu correo y te enviaremos un link para restablecer tu contraseña
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md w-full px-4 sm:px-0">
          <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-xl sm:px-10 border border-slate-100 dark:border-slate-700">
            {mutation.isSuccess ? (
              <div className="text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                  <span className="material-symbols-outlined text-green-600">check</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Email enviado</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Si el correo está registrado, recibirás un link en unos minutos. Revisa también tu carpeta de spam.
                </p>
                <div className="mt-6">
                  <Link to="/login" className="text-blue-600 font-medium hover:text-blue-500">
                    Volver al inicio de sesión
                  </Link>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {mutation.isError && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                    {(mutation.error as any).message}
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Correo electrónico
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      {...register("email", { required: true })}
                      className="block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2.5 placeholder-slate-400 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm bg-white dark:bg-slate-700 dark:text-white"
                      placeholder="tu@clinica.com"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? "Enviando..." : "Enviar link de recuperación"}
                  </button>
                </div>
              </form>
            )}
          </div>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            ¿Recordaste tu contraseña?{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
