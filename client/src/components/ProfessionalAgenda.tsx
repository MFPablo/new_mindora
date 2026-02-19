import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Calendar, Video, Clock, ClipboardList, CalendarClock } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export function ProfessionalAgenda() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const { data } = useQuery({
    queryKey: ['professional-appointments'],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/professional/appointments`, { credentials: "include" })
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
            <h1 className="text-[#0e121b] dark:text-white text-2xl md:text-3xl font-black tracking-tight">Mi Agenda</h1>
            <p className="text-[#4d6599] dark:text-slate-400 text-sm md:text-base">Gestiona tus sesiones y pacientes.</p>
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
                          {format(parseISO(app.dateTime), 'HH:mm')} - {app.patient.name}
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

          <aside className="w-[380px] shrink-0 flex flex-col gap-6 bg-white dark:bg-slate-800 rounded-2xl border border-[#e7ebf3] dark:border-slate-700 shadow-lg p-6 overflow-y-auto">
            <div>
              <h3 className="text-lg font-bold text-[#0e121b] dark:text-white mb-1">Pacientes del Día</h3>
              <p className="text-[#2563eb] font-semibold capitalize">
                {selectedDate ? format(selectedDate, "d MMMM, yyyy", { locale: es }) : 'Selecciona un día'}
              </p>
            </div>

            {selectedAppointments.length > 0 ? (
              <div className="space-y-4">
                {selectedAppointments.map((app: any) => (
                  <div key={app.id} className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-[#e7ebf3] dark:border-slate-700 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                        <Clock className="size-3.5" />
                        <span>{format(parseISO(app.dateTime), 'HH:mm')}</span>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        app.status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                      )}>
                        {app.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img className="rounded-xl h-12 w-12 object-cover" src={app.patient.image || `https://ui-avatars.com/api/?name=${app.patient.name}`} alt={app.patient.name} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#0e121b] dark:text-white truncate">{app.patient.name}</h4>
                        <p className="text-xs text-[#4d6599] dark:text-slate-400 truncate">{app.patient.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors">
                        <ClipboardList className="size-3.5" />
                        H. Clínica
                      </button>
                      <button className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                        <CalendarClock className="size-3.5" />
                        Reprogramar
                      </button>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Video className="size-3.5 text-[#2563eb]" />
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Modalidad: {app.type === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</span>
                        </div>
                        {app.type === 'VIRTUAL' && (
                          <button className="px-4 py-1.5 text-[11px] font-bold text-white bg-[#2563eb] rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                            Unirse
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#f8f9fc] dark:bg-slate-900/50 rounded-xl p-8 border border-dashed border-[#e7ebf3] dark:border-slate-700 flex flex-col items-center justify-center text-center">
                <Calendar className="size-10 text-[#4d6599]/30 mb-3" />
                <p className="text-sm text-[#4d6599] font-medium">Sin citas para este día</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
