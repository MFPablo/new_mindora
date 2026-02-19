import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

import { SERVER_URL } from "@/lib/api";

function PricingPage() {
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/auth/session`, { credentials: `include` });
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 5000,
  });

  const handlePlanSelection = (planId: string) => {
    if (session?.user) {
      // Authenticated: Go to Profile > Billing
      window.location.href = "/profile?section=billing";
    } else {
      // Guest: Go to Signup with plan param
      navigate({
        to: "/signup",
        search: { plan: planId } as any
      });
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Precios simples para tu <br className="hidden sm:block" />
              <span className="text-blue-600">consulta privada</span>
            </h1>
            <p className="mt-5 text-xl text-gray-500 dark:text-gray-400">
              Gestiona tus pacientes, historias clínicas y agenda en un solo lugar seguro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative">
            {/* Free Plan */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex flex-col h-full hover:border-blue-600/50 transition-colors duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Plan Gratuito</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Ideal para profesionales que están comenzando.</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-500 dark:text-gray-400">/mes</span>
              </div>
              <button
                onClick={() => handlePlanSelection("free")}
                className="block w-full py-3 px-6 text-center rounded-lg border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-600/5 transition-colors mb-8"
              >
                Comenzar Gratis
              </button>
              <div className="space-y-4 flex-grow">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Incluye:</p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Hasta 3 pacientes activos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Historias clínicas básicas (Subjetivo y Plan)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Gestión de enlaces privados</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Almacenamiento seguro</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Monthly */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 flex flex-col h-full relative hover:border-blue-600/50 transition-colors duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Premium Mensual</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Para profesionales establecidos que buscan automatización.</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$29</span>
                <span className="text-gray-500 dark:text-gray-400">/mes</span>
              </div>
              <button
                onClick={() => handlePlanSelection("professional_monthly")}
                className="block w-full py-3 px-6 text-center rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors mb-8 shadow-md shadow-blue-600/20"
              >
                Elegir Mensual
              </button>
              <div className="space-y-4 flex-grow">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Todo lo de Free más:</p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Pacientes ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Reprogramación automática según políticas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Gestión de pagos (Manual y Online)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Portal de pacientes con links útiles</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Yearly */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border-2 border-blue-600 p-8 flex flex-col h-full relative transform md:-translate-y-4 z-10">
              <div className="absolute top-0 right-0 left-0 -mt-4 flex justify-center">
                <span className="bg-gradient-to-r from-indigo-500 via-blue-600 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                  Mejor Valor
                </span>
              </div>
              <div className="absolute top-6 right-6">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  2 Meses Gratis
                </span>
              </div>
              <div className="mb-6 mt-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Premium Anual</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">"El mejor valor para tu práctica a largo plazo".</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$290</span>
                  <span className="text-gray-500 dark:text-gray-400">/año</span>
                </div>
                <p className="text-xs text-blue-600 font-medium mt-1">Equivalente a $24.16/mes</p>
              </div>
              <button
                onClick={() => handlePlanSelection("professional_yearly")}
                className="block w-full py-3 px-6 text-center rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors mb-8 shadow-lg shadow-blue-600/30 ring-4 ring-blue-600/10"
              >
                Elegir Anual
              </button>
              <div className="space-y-4 flex-grow">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Todo lo de Premium más:</p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Soporte prioritario</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Personalización de marca en el perfil</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Dashboard de analíticas de sesiones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 text-sm mt-0.5 mr-2">check_circle</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Asistencia en migración de datos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confiado por profesionales de la salud</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Únete a una comunidad enfocada en lo que realmente importa.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard
                name="Dra. Sara Jiménez"
                role="Psicólogo Clínico"
                content="El plan anual de Mindora es una decisión obvia. Solo la programación automática me ahorra unas 5 horas a la semana."
                avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuBrPLKm9XJojETPPK8zqy_Q2z9SOeqQAnnKWqw-AEfRubGMKwrFjqyfttb6QdwLYOGGcwjItLd0uHcnmlHNMYjuMaoki4diguZctSL27geDzVKGljUgCj6dJt7_rtN8vawXFEJOraO_p46aoUmCNh25RoqP4cjzG9XV5-nWjEVmDl07bhzMc1o-L5ThECxf1YNJepYdr0_hUY_iW6xSQRxurTHE6Utv7RF-6Iro50xXN6yBBNRTGODgjg3XmrtnZ3Wpj7ZZJNebv7xN"
              />
              <TestimonialCard
                name="Miguel Ángel Ruiz"
                role="Terapeuta Ocupacional"
                content="El nivel gratuito me ayudó a empezar con mis primeros pacientes. La actualización fue muy sencilla cuando mi práctica creció."
                initials="MA"
                color="blue"
              />
              <TestimonialCard
                name="Ana Lucía Torres"
                role="Fonoaudióloga"
                content="Finalmente, un software que entiende cómo se documentan realmente las sesiones de fonoaudiología."
                initials="AL"
                color="green"
              />
            </div>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-8 mt-16 grayscale opacity-60">
            <div className="flex items-center gap-2">
              <span className="material-icons text-gray-500">shield</span>
              <span className="text-sm font-bold text-gray-500">Cumple Normativas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icons text-gray-500">lock_outline</span>
              <span className="text-sm font-bold text-gray-500">Seguridad Bancaria</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icons text-gray-500">cloud_done</span>
              <span className="text-sm font-bold text-gray-500">99.9% Disponibilidad</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TestimonialCard({ name, role, content, avatar, initials, color }: { name: string; role: string; content: string; avatar?: string; initials?: string; color?: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className="bg-white/50 dark:bg-white/5 p-6 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-4 mb-4">
        {avatar ? (
          <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
            <img alt={name} className="h-full w-full object-cover" src={avatar} />
          </div>
        ) : (
          <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${colorClasses[color || `blue`]}`}>
            {initials}
          </div>
        )}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">{name}</h4>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 italic">{content}</p>
    </div>
  );
}
