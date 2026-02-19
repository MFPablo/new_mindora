import { format } from "date-fns";
import { es } from "date-fns/locale";

import { EmergencyCard } from "./EmergencyCard";

interface DashboardHomeProps {
  user: any;
  dashboard: any;
  isLoading: boolean;
  onOpenCrisisModal: () => void;
  onViewSessions: () => void;
}

export function DashboardHome({ user, dashboard, isLoading, onOpenCrisisModal, onViewSessions }: DashboardHomeProps) {
  return (
    <main className="flex-1 md:ml-20 p-4 lg:p-8 overflow-y-auto w-full pb-24 transition-[margin] duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Hola, {user?.name?.split(" ")[0] || "Alex"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Administra tus sesiones y accede a tus recursos.</p>
        </div>
        <button className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Solicitar Turno</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-3 rounded-xl p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined">calendar_clock</span>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Próxima Sesión</p>
                <p className="text-slate-900 dark:text-white text-xl font-bold mt-1">
                  {dashboard?.nextSession ? format(new Date(dashboard.nextSession.dateTime), "d MMM, H:mm", { locale: es }) : "Sin agendar"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <div className="size-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Mi Equipo</p>
                <p className="text-slate-900 dark:text-white text-xl font-bold mt-1">
                  {dashboard?.stats?.teamCount || 0} Profesional{dashboard?.stats?.teamCount !== 1 && "es"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <div className="size-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined">library_books</span>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Recursos</p>
                <p className="text-slate-900 dark:text-white text-xl font-bold mt-1">
                  {dashboard?.stats?.resourcesCount || 0} Nuevos
                </p>
              </div>
            </div>
          </div>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Próximas Sesiones</h2>
              <button
                onClick={onViewSessions}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                Ver calendario
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500">Cargando sesiones...</div>
              ) : dashboard?.upcomingSessions?.length > 0 ? (
                dashboard.upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
                    <div className="relative shrink-0">
                      <img
                        className="rounded-xl h-16 w-16 object-cover bg-slate-200"
                        src={session.professional.image || `https://ui-avatars.com/api/?name=${session.professional.name}`}
                        alt={session.professional.name}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white dark:border-slate-800 size-4 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-slate-900 dark:text-white text-base font-bold truncate">{session.professional.name}</h3>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mt-1">
                        <span className="material-symbols-outlined text-[16px]">videocam</span>
                        <span>Video Consulta • {session.professional.specialty || "Sesión"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 font-medium text-sm mt-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span>{format(new Date(session.dateTime), "EEEE d 'de' MMMM, HH:mm", { locale: es })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <button className="flex-1 sm:flex-none items-center justify-center rounded-lg px-4 py-2 bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
                        Unirse
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-3">
                    <span className="material-symbols-outlined">event_busy</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">No tienes sesiones próximas</p>
                  <p className="text-sm text-slate-500 max-w-xs mt-1">Agenda una cita con tu profesional para comenzar.</p>
                  <button className="mt-4 text-sm text-blue-600 font-semibold hover:underline">Explorar Profesionales</button>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mis Profesionales</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboard?.myProfessionals?.length > 0 ? (
                dashboard.myProfessionals.map((pro: any) => (
                  <div key={pro.id} className="group bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-600/30 transition-all">
                    <div className="flex items-start justify-between">
                      <img
                        src={pro.image || `https://ui-avatars.com/api/?name=${pro.name}`}
                        className="rounded-full h-14 w-14 border border-slate-200 dark:border-slate-700 object-cover"
                        alt={pro.name}
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pro.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{pro.specialty || "Profesional de Salud"}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                      <a
                        href={`/professional/${pro.id}`}
                        className="flex-1 rounded-lg py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-center"
                      >
                        Perfil
                      </a>
                      <button className="flex-1 rounded-lg py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition-colors">
                        Mensaje
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-6 text-center text-slate-500 italic">
                  Aún no tienes profesionales agregados a tu equipo.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">folder_open</span>
              Recursos Útiles
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Documentos y enlaces compartidos por tu equipo.</p>
            <ul className="flex flex-col gap-3">
              <li className="group">
                <a className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700" href="#">
                  <div className="size-10 rounded bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">Guía de Ansiedad</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">PDF • 2.4 MB</p>
                  </div>
                </a>
              </li>
              <li className="group">
                <a className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700" href="#">
                  <div className="size-10 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">link</span>
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">Playlist de Meditación</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Spotify Link</p>
                  </div>
                </a>
              </li>
            </ul>
            <button className="w-full mt-4 text-sm text-blue-600 font-medium hover:underline text-center">Ver Todos</button>
          </div>
          <EmergencyCard onOpenModal={onOpenCrisisModal} />
        </aside>
      </div>
    </main>
  );
}
