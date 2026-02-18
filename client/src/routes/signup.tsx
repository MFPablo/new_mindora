import { createFileRoute, Link } from "@tanstack/react-router";
import { SignupForm } from "@/components/signup/SignupForm";
import { SignupBenefits } from "@/components/signup/SignupBenefits";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import { z } from "zod";

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>) => {
    return z.object({
      plan: z.string().optional(),
    }).parse(search);
  },
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="bg-brand-light dark:bg-brand-dark font-display text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
      <Navbar />
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
      <Footer />
    </div>
  );
}

export default SignupPage;
