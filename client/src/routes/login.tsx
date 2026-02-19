import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SERVER_URL } from "@/lib/api";

import { redirectIfAuth, getHomeDashboard } from "@/lib/auth-guard";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => redirectIfAuth({ queryClient: context.queryClient }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch() as { redirect?: string };
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: { email: string; password: string; rememberMe: boolean }) => {
      const res = await fetch(`${SERVER_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        }),
        credentials: "include",
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Credenciales inválidas");
      }

      return responseData;
    },
    onSuccess: (data) => {
      const { user } = data;
      if (user.role === "professional" && user.onboardingStep < 3) {
        window.location.href = "/onboarding/step-1";
      } else if (redirect) {
        window.location.href = redirect;
      } else {
        window.location.href = getHomeDashboard(user);
      }
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      setError("root", { message: "Correo o contraseña incorrectos" });
    },
  });

  const onSubmit = (data: any) => {
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
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Ingresa para acceder a tu panel de práctica
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md w-full px-4 sm:px-0">
          <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-xl sm:px-10 border border-slate-100 dark:border-slate-700">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {errors.root && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                  {errors.root.message}
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
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    {...register("password", { required: true })}
                    className="block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2.5 pr-10 placeholder-slate-400 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm bg-white dark:bg-slate-700 dark:text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    {...register("rememberMe")}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 bg-white dark:bg-slate-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">O continuar con</span>
                </div>
              </div>

              <div className="mt-6">
                <form action={`${SERVER_URL}/auth/signin/google`} method="POST">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center items-center gap-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
                  >
                    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M12.0003 20.45c4.6667 0 8.0834-3.2083 8.0834-7.9583 0-0.625-0.0834-1.25-0.2084-1.8334h-7.875v3.5h4.5c-0.2083 1.25-1.2083 3.375-4.5 3.375-2.7083 0-4.9166-2.2083-4.9166-4.9583s2.2083-4.9583 4.9166-4.9583c1.5417 0 2.9167 0.5417 3.9583 1.5417l2.625-2.625c-1.75-1.625-4.0416-2.5833-6.5833-2.5833-5.4166 0-9.7916 4.375-9.7916 9.7916s4.375 9.7917 9.7916 9.7917z"
                        fill="#4285F4"
                      ></path>
                      <path
                        d="M3.41699 8.24996l2.9167 2.1667c0.7083-2.125 2.7083-3.625 5.0833-3.625 1.5417 0 2.9167 0.5417 3.9583 1.5417l2.625-2.625c-1.75-1.625-4.0416-2.5834-6.5833-2.5834-3.7917 0-7.0417 2.1667-8.5833 5.125l0.5833 0z"
                        fill="#EA4335"
                      ></path>
                      <path
                        d="M12.0003 20.45c2.4584 0 4.7084-0.875 6.4584-2.375l-2.9584-2.2917c-0.875 0.5834-2.0416 1.0417-3.5 1.0417-2.7083 0-4.9166-2.2084-4.9166-4.9584 0-0.2916 0.0417-0.5416 0.0834-0.8333l-2.875 2.2083c1.5416 2.9167 4.7916 5.0834 8.5833 5.0834v2.125z"
                        fill="#34A853"
                      ></path>
                      <path
                        d="M5.5003 13.9583c-0.2083-0.625-0.3333-1.2916-0.3333-1.9583s0.125-1.3333 0.3333-1.9583l-2.9167-2.1667c-0.625 1.25-1 2.6667-1 4.125s0.375 2.875 1 4.125l2.9167-2.1667z"
                        fill="#FBBC05"
                      ></path>
                    </svg>
                    <span className="sr-only">Iniciar sesión con Google</span>
                    Iniciar sesión con Google
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Protegido por reCAPTCHA y sujeto a la{" "}
              <a href="#" className="font-medium text-blue-600 hover:underline">
                Política de Privacidad
              </a>{" "}
              y{" "}
              <a href="#" className="font-medium text-blue-600 hover:underline">
                Términos de Servicio
              </a>{" "}
              de Mindora.
            </p>
          </div>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            ¿No tienes una cuenta?{" "}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Crea una cuenta
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LoginPage;
