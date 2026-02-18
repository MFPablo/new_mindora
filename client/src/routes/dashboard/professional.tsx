import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/professional")({
  component: ProfessionalDashboard,
});

function ProfessionalDashboard() {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/auth/session`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const user = session?.user;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-display text-slate-800 dark:text-slate-200 min-h-screen flex flex-col antialiased">
      <Navbar />
      <div className="flex-grow flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col fixed h-full z-10">
          <nav className="flex-1 px-4 space-y-2 mt-8">
            <a className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all" href="#">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="font-medium">Dashboard</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors group" href="#">
              <span className="material-symbols-outlined text-[20px] group-hover:text-blue-600 transition-colors">people</span>
              <span className="font-medium">Pacientes</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors group" href="#">
              <span className="material-symbols-outlined text-[20px] group-hover:text-blue-600 transition-colors">calendar_today</span>
              <span className="font-medium">Agenda</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors group" href="#">
              <span className="material-symbols-outlined text-[20px] group-hover:text-blue-600 transition-colors">chat_bubble_outline</span>
              <span className="font-medium">Mensajes</span>
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors group" href="#">
              <span className="material-symbols-outlined text-[20px] group-hover:text-blue-600 transition-colors">description</span>
              <span className="font-medium">Documentos</span>
            </a>
          </nav>
          <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
              <img
                alt={user?.name || "Profile"}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-600/20"
                src={user?.image || "https://ui-avatars.com/api/?name=" + (user?.name || "User")}
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || "Profesional"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.specialty || "Terapeuta"}</p>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">settings</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 lg:p-8 overflow-y-auto w-full">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Buenos días, {user?.name?.split(" ")[0] || "Dr. Smith"}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Tienes <span className="text-blue-600 font-semibold">8 citas</span> agendadas para hoy.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <input className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/50 w-64 text-sm shadow-sm transition-shadow" placeholder="Buscar pacientes..." type="text" />
              </div>
              <button className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors relative shadow-sm">
                <span className="material-symbols-outlined text-[20px]">notifications_none</span>
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined">people</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pacientes Totales</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">24</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Completado</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">12</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Informes Pendientes</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">5</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <span className="material-symbols-outlined">star</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Satisfacción</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">4.9</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">event_note</span>
                    Próximas Sesiones
                  </h2>
                  <a className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors" href="#">Ver Calendario</a>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  <div className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <div className="flex items-start md:items-center gap-4">
                      <div className="flex-shrink-0 relative">
                        <img alt="Sarah Jenkins" className="w-12 h-12 rounded-lg object-cover" src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random" />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">Sarah Jenkins</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Edad: 32 • Mujer</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-300">
                          <span className="material-symbols-outlined text-[18px] text-slate-400">schedule</span>
                          09:00 AM - 09:30 AM
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Confirmado</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">bolt</span>
                  Acciones Rápidas
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  <button className="group flex items-center gap-4 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-600 hover:text-white border border-blue-100 dark:border-blue-900/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 group-hover:bg-white/20 flex items-center justify-center text-blue-600 group-hover:text-white transition-colors shadow-sm">
                      <span className="material-symbols-outlined">edit_note</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 dark:text-white group-hover:text-white">Nueva Nota SOAP</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80">Documentar sesión</p>
                    </div>
                  </button>
                  <button className="group flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <span className="material-symbols-outlined">add_reaction</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 dark:text-white">Añadir Paciente</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Crear ficha</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
