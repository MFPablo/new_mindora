import { createFileRoute, Link } from "@tanstack/react-router";
import { SignupForm } from "@/components/signup/SignupForm";
import { SignupBenefits } from "@/components/signup/SignupBenefits";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="bg-brand-light dark:bg-brand-dark font-display text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
      <header className="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-brand-primary text-2xl">psychology</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Mindora</span>
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ¿Ya tienes una cuenta? <Link to="/" className="text-brand-primary hover:text-blue-700 font-medium">Iniciar sesión</Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          <SignupBenefits />
          <div className="lg:col-span-7">
            <SignupForm />
            <div className="flex items-center justify-center gap-6 mt-8 opacity-70">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-gray-400 text-lg">verified_user</span>
                <span className="text-xs font-semibold text-gray-500">Cumple con HIPAA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-gray-400 text-lg">lock</span>
                <span className="text-xs font-semibold text-gray-500">Datos encriptados</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
