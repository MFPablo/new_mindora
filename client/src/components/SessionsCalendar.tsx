import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, startOfWeek, endOfWeek, parseISO, differenceInHours } from 'date-fns'
import { es } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Calendar, Video, Clock, Plus } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { SERVER_URL } from "@/lib/api";

export function SessionsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const { data } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/patient/appointments`, { credentials: "include" })
      if (!res.ok) throw new Error('Failed to fetch appointments')
      const json = await res.json()
      return json.appointments as any[]
    },
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const selectedAppointments = data?.filter((app: any) => {
    const appDate = parseISO(app.dateTime);
    const selected = selectedDate || new Date();
    return format(appDate, 'yyyy-MM-dd') === format(selected, 'yyyy-MM-dd');
  }) || []

  return (
    <div className="flex-1 md:ml-20 flex flex-col h-[calc(100vh-80px)] overflow-hidden transition-[margin] duration-300">
      <div className="px-6 py-6 md:px-8 md:py-8 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-[#0e121b] dark:text-white text-2xl md:text-3xl font-black tracking-tight">Mi Calendario</h1>
            <p className="text-[#4d6599] dark:text-slate-400 text-sm md:text-base">Gestiona tus próximas sesiones.</p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-[#e7ebf3] dark:border-slate-700 shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-[#f8f9fc] dark:hover:bg-slate-700 rounded-lg text-[#4d6599] transition-colors">
              <ChevronLeft className="size-5" />
            </button>
            <span className="text-lg font-bold text-[#0e121b] dark:text-white min-w-[140px] text-center capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-[#f8f9fc] dark:hover:bg-slate-700 rounded-lg text-[#4d6599] transition-colors">
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-[#e7ebf3] dark:border-slate-700 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="grid grid-cols-7 border-b border-[#e7ebf3] dark:border-slate-700">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="p-4 text-center text-sm font-semibold text-[#4d6599] dark:text-slate-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
              {calendarDays.map((day, idx) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const appointmentsOnDay = data?.filter((app: any) => format(parseISO(app.dateTime), 'yyyy-MM-dd') === dayStr) || []
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                const currentMonth = isSameMonth(day, monthStart)

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "border-b border-r border-[#e7ebf3] dark:border-slate-700 p-2 min-h-[100px] hover:bg-[#f8f9fc] dark:hover:bg-slate-700 transition-colors relative group cursor-pointer",
                      !currentMonth && "bg-[#f8f9fc]/30 dark:bg-slate-900/30",
                      isSelected && "bg-[#2563eb]/5 ring-2 ring-inset ring-[#2563eb]"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "font-medium p-1 flex items-center justify-center size-7 rounded-full",
                        !currentMonth ? "text-[#4d6599]/40" : "text-[#4d6599] dark:text-slate-400",
                        isToday && !isSelected && "bg-[#2563eb] text-white",
                        isSelected && "bg-[#2563eb] text-white font-bold"
                      )}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {appointmentsOnDay.slice(0, 2).map((app: any, appIdx: number) => (
                        <div
                          key={app.id}
                          className={cn(
                            "mx-1 p-1.5 rounded truncate text-[10px] font-bold",
                            appIdx === 0 ? "bg-[#2563eb]/10 border-l-2 border-[#2563eb] text-[#2563eb]" : "bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-500 text-purple-700 dark:text-purple-300"
                          )}
                        >
                          {format(parseISO(app.dateTime), 'HH:mm')} - {app.professional.name}
                        </div>
                      ))}
                      {appointmentsOnDay.length > 2 && (
                        <div className="mx-1 text-[10px] text-[#4d6599] font-medium pl-1">+ {appointmentsOnDay.length - 2} más</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <aside className="w-80 shrink-0 flex flex-col gap-6 bg-white dark:bg-slate-800 rounded-2xl border border-[#e7ebf3] dark:border-slate-700 shadow-lg p-6 overflow-y-auto">
            <div>
              <h3 className="text-lg font-bold text-[#0e121b] dark:text-white mb-1">Detalle del Día</h3>
              <p className="text-[#2563eb] font-semibold capitalize">
                {selectedDate ? format(selectedDate, "d MMMM, yyyy", { locale: es }) : 'Selecciona un día'}
              </p>
            </div>

            {selectedAppointments.length > 0 ? (
              <div className="space-y-4">
                {selectedAppointments.map((app: any) => (
                  <div key={app.id} className="bg-[#2563eb]/5 rounded-xl p-5 border border-[#2563eb]/20 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-[#2563eb] font-bold text-sm">
                      <div className="size-2 rounded-full bg-[#2563eb]"></div>
                      <span>Sesión Confirmada</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <img className="rounded-xl h-14 w-14 object-cover" src={app.professional.image || `https://ui-avatars.com/api/?name=${app.professional.name}`} alt={app.professional.name} />
                      <div>
                        <h4 className="font-bold text-[#0e121b] dark:text-white">{app.professional.name}</h4>
                        <p className="text-xs text-[#4d6599] dark:text-slate-400">{app.professional.specialty}</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-2 border-t border-[#2563eb]/10">
                      <div className="flex items-center gap-3 text-[#0e121b] dark:text-white">
                        <Clock className="size-4 text-[#2563eb]" />
                        <div>
                          <p className="text-xs text-[#4d6599] font-medium">Hora</p>
                          <p className="text-sm font-bold">{format(parseISO(app.dateTime), 'HH:mm')} - {format(new Date(parseISO(app.dateTime).getTime() + 60 * 60 * 1000), 'HH:mm')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[#0e121b] dark:text-white">
                        <Video className="size-4 text-[#2563eb]" />
                        <div>
                          <p className="text-xs text-[#4d6599] font-medium">Tipo</p>
                          <p className="text-sm font-bold">{app.type === 'VIRTUAL' ? 'Videollamada' : 'Presencial'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      {(() => {
                        const canReschedule = differenceInHours(parseISO(app.dateTime), new Date()) >= (app.professional.minAnticipationHours || 1);
                        return (
                          <button
                            disabled={!canReschedule}
                            className={cn(
                              "flex-1 py-2 text-sm font-semibold rounded-lg transition-colors border",
                              canReschedule
                                ? "text-[#2563eb] bg-white dark:bg-slate-700 border-[#e7ebf3] dark:border-slate-600 hover:bg-[#2563eb] hover:text-white"
                                : "text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60"
                            )}
                            title={!canReschedule ? `Se requiere ${app.professional.minAnticipationHours || 1}h de anticipación` : ""}
                          >
                            Reprogramar
                          </button>
                        );
                      })()}
                      {app.type === 'VIRTUAL' && (
                        <button className="flex-1 py-2 text-sm font-semibold text-white bg-[#2563eb] rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                          Unirse
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#f8f9fc] dark:bg-slate-900/50 rounded-xl p-8 border border-dashed border-[#e7ebf3] dark:border-slate-700 flex flex-col items-center justify-center text-center">
                <Calendar className="size-10 text-[#4d6599]/30 mb-3" />
                <p className="text-sm text-[#4d6599] font-medium">No hay sesiones para este día</p>
              </div>
            )}

            <div className="border-t border-dashed border-[#e7ebf3] dark:border-slate-700 pt-6 mt-auto">
              <h4 className="font-bold text-[#0e121b] dark:text-white mb-3 text-sm">Otras disponibilidades</h4>
              <button className="w-full py-2.5 rounded-xl border border-dashed border-[#2563eb]/40 text-[#2563eb] hover:bg-[#2563eb]/5 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Plus className="size-4" /> Nueva Solicitud
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
