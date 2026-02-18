import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || undefined,
    };
  },
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = useSearch({ from: "/reset-password" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
      const res = await fetch(`${serverUrl}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || "Error al restablecer la contraseña");
      return responseData;
    },
    onSuccess: () => {
      setTimeout(() => navigate({ to: "/login" }), 3000);
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const password = watch("password");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Token faltante</h1>
          <p className="mb-4">Este enlace no es válido. Por favor, solicita uno nuevo.</p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Solicitar nuevo link
          </Link>
        </div>
      </div>
    );
  }

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
            Nueva contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Ingresa tu nueva contraseña para recuperar el acceso
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md w-full px-4 sm:px-0">
          <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-xl sm:px-10 border border-slate-100 dark:border-slate-700">
            {mutation.isSuccess ? (
              <div className="text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                  <span className="material-symbols-outlined text-green-600">check</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">¡Contraseña actualizada!</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Tu contraseña ha sido restablecida con éxito. Serás redireccionado al login en unos segundos.
                </p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {mutation.isError && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                    {mutation.error.message}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nueva contraseña
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      {...register("password", { required: "Contraseña requerida", minLength: { value: 8, message: "Mínimo 8 caracteres" } })}
                      className="block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2.5 pr-10 placeholder-slate-400 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm bg-white dark:bg-slate-700 dark:text-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirmar nueva contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      required
                      {...register("confirmPassword", {
                        required: "Por favor confirma tu contraseña",
                        validate: value => value === password || "Las contraseñas no coinciden"
                      })}
                      className="block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2.5 placeholder-slate-400 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm bg-white dark:bg-slate-700 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? "Restableciendo..." : "Restablecer contraseña"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
