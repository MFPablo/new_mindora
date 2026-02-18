import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "shared";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export function SignupForm() {
    const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "patient",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SignupInput) => {
      const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
      
      // 1. Register User
      const signupRes = await fetch(`${serverUrl}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        throw new Error(signupData.message || "Error al registrar usuario");
      }

      // 2. Auto-login
      const loginRes = await fetch(`${serverUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
        credentials: "include",
      });

      console.log("Auto-login response:", loginRes.status);
      
      return signupData;
    },
    onSuccess: () => {
      // Force redirect to profile to verify session
      window.location.href = "/profile";
    },
    onError: (error) => {
      console.error("Error registering:", error);
      alert(`Error: ${error.message}`);
    }
  });

  const onSubmit = (data: SignupInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-8 lg:p-10">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Me estoy uniendo como...</label>
          <div className="grid grid-cols-2 gap-4">
            <label className="cursor-pointer group">
              <input 
                {...register("role")}
                className="peer sr-only" 
                type="radio" 
                value="patient" 
              />
              <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 text-center hover:border-brand-primary peer-checked:border-brand-primary peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all">
                <div className="mx-auto h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 peer-checked:bg-blue-500 peer-checked:text-white transition-colors">
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 peer-checked:text-white group-hover:text-brand-primary">accessibility_new</span>
                </div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">Paciente</span>
              </div>
            </label>
            <label className="cursor-pointer group">
              <input 
                 {...register("role")}
                className="peer sr-only" 
                type="radio" 
                value="professional" 
              />
              <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 text-center hover:border-brand-primary peer-checked:border-brand-primary peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all">
                <div className="mx-auto h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 peer-checked:bg-blue-500 peer-checked:text-white transition-colors">
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 peer-checked:text-white group-hover:text-brand-primary">medical_services</span>
                </div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">Profesional</span>
              </div>
            </label>
          </div>
          {errors.role && <p className="mt-1 text-sm text-red-600 dark:text-red-400 text-center">{errors.role.message}</p>}
        </div>
        <form action={`${import.meta.env.VITE_SERVER_URL || "http://localhost:3000"}/auth/signin/google`} method="POST">
          <button 
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors" 
            type="submit"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M12.0003 20.45c4.6667 0 8.0834-3.2083 8.0834-7.9583 0-0.625-0.0834-1.25-0.2084-1.8334h-7.875v3.5h4.5c-0.2083 1.25-1.2083 3.375-4.5 3.375-2.7083 0-4.9166-2.2083-4.9166-4.9583s2.2083-4.9583 4.9166-4.9583c1.5417 0 2.9167 0.5417 3.9583 1.5417l2.625-2.625c-1.75-1.625-4.0416-2.5833-6.5833-2.5833-5.4166 0-9.7916 4.375-9.7916 9.7916s4.375 9.7917 9.7916 9.7917z" fill="#4285F4"></path>
              <path d="M3.41699 8.24996l2.9167 2.1667c0.7083-2.125 2.7083-3.625 5.0833-3.625 1.5417 0 2.9167 0.5417 3.9583 1.5417l2.625-2.625c-1.75-1.625-4.0416-2.5834-6.5833-2.5834-3.7917 0-7.0417 2.1667-8.5833 5.125l0.5833 0z" fill="#EA4335"></path>
              <path d="M12.0003 20.45c2.4584 0 4.7084-0.875 6.4584-2.375l-2.9584-2.2917c-0.875 0.5834-2.0416 1.0417-3.5 1.0417-2.7083 0-4.9166-2.2084-4.9166-4.9584 0-0.2916 0.0417-0.5416 0.0834-0.8333l-2.875 2.2083c1.5416 2.9167 4.7916 5.0834 8.5833 5.0834v2.125z" fill="#34A853"></path>
              <path d="M5.5003 13.9583c-0.2083-0.625-0.3333-1.2916-0.3333-1.9583s0.125-1.3333 0.3333-1.9583l-2.9167-2.1667c-0.625 1.25-1 2.6667-1 4.125s0.375 2.875 1 4.125l2.9167-2.1667z" fill="#FBBC05"></path>
            </svg>
            Registrarse con Google
          </button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-900 text-gray-500">O continuar con correo</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="name">Nombre completo</label>
          <input 
            {...register("name")}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm py-3 px-4 transition-shadow" 
            id="name" 
            placeholder="Juan Pérez" 
            type="text" 
          />
          {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="email">Correo electrónico</label>
          <input 
            {...register("email")}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm py-3 px-4 transition-shadow" 
            id="email" 
            placeholder="tu@ejemplo.com" 
            type="email" 
          />
          {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="password">Contraseña</label>
          <div className="relative">
            <input 
              {...register("password")}
              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm py-3 px-4 transition-shadow" 
              id="password" 
              placeholder="Crear una contraseña" 
              type={showPassword ? "text" : "password"}
            />
            <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined text-gray-400 text-sm hover:text-gray-600">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </div>
          </div>
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Debe tener al menos 8 caracteres.</p>
          )}
        </div>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input 
              {...register("terms")}
              className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-gray-300 rounded" 
              id="terms" 
              type="checkbox" 
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700 dark:text-gray-300" htmlFor="terms">Acepto los <Link to="/" className="text-brand-primary hover:text-blue-700">Términos de Servicio</Link> y la <Link to="/" className="text-brand-primary hover:text-blue-700">Política de Privacidad</Link></label>
          </div>
        </div>
        {errors.terms && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.terms.message}</p>}
        <button 
          className="w-full flex items-center justify-center py-3.5 px-8 border border-transparent rounded-lg shadow-lg shadow-blue-500/20 text-base font-semibold text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed" 
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

    </div>
  );
}
