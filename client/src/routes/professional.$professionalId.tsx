import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState, useMemo, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay, isBefore, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/professional/$professionalId")({
  beforeLoad: ({ context }) => requireAuth({ queryClient: context.queryClient }),
  component: PublicProfessionalProfile,
});

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface ProfessionalData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  specialty: string | null;
  address: string | null;
  phone: string | null;
  licenseNumber: string | null;
  bio: string | null;
  languages: string[];
  sessionPrice: number | null;
  workingHours: Record<string, { start: string; end: string }> | null;
  minAnticipationHours: number;
  role: string;
}

interface Appointment {
  id: string;
  dateTime: string;
  status: string;
}

// Helper: generate time slots from workingHours
function generateSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  let h = startH;
  let m = startM;
  while (h < endH || (h === endH && m < endM)) {
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    m += 60; // 1-hour slots
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
  }
  return slots;
}

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];


function NotFoundScreen() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 font-display text-slate-800 dark:text-slate-200 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-4xl">person_off</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Perfil no encontrado</h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Este profesional no existe o su perfil no está disponible.</p>
          <a href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Volver al inicio
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function BookingModal({
  isOpen,
  onClose,
  onConfirm,
  slot,
  professional,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  slot: { date: Date; time: string } | null;
  professional: ProfessionalData;
  isPending: boolean;
}) {
  if (!isOpen || !slot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Confirmar Reserva</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div
                className="w-12 h-12 rounded-full bg-cover bg-center shrink-0 border-2 border-white dark:border-slate-600"
                style={{
                  backgroundImage: professional.image
                    ? `url("${professional.image}")`
                    : `url("https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=2563EB&color=fff")`,
                }}
              />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{professional.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{professional.specialty}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Fecha</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">
                  {format(slot.date, "EEEE d 'de' MMMM", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Hora</span>
                <span className="font-medium text-slate-900 dark:text-white">{slot.time} hs</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-500 dark:text-slate-400">Precio</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">${professional.sessionPrice}</span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : (
                "Confirmar Reserva"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicProfessionalProfile() {
  const params = useParams({ from: "/professional/$professionalId" });
  const professionalId = params.professionalId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Professional Profile
  const { data, isLoading, error } = useQuery({
    queryKey: ["professional-public", professionalId],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/professional/${professionalId}/public`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw { status: res.status, ...json };
      return json as { success: boolean; professional: ProfessionalData; isPublic: boolean; isOwner?: boolean };
    },
    retry: false,
  });

  useEffect(() => {
    if (error) {
      const err = error as { status?: number; message?: string };
      if (err.status === 403) {
        navigate({ to: "/dashboard/patient" });
      }
    }
  }, [error, navigate]);

  // Calculate Week Dates
  const weekStart = useMemo(() => {
    const today = new Date();
    // Adjust to start on Monday
    const start = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
    return start;
  }, [weekOffset]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Fetch Appointments for the viewed week
  const { data: appointmentData, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments", professionalId, format(weekStart, "yyyy-MM-dd")],
    queryFn: async () => {
      const res = await fetch(
        `${SERVER_URL}/api/professional/${professionalId}/appointments?weekStart=${format(weekStart, "yyyy-MM-dd")}`
      );
      return (await res.json()) as { success: boolean; appointments: Appointment[] };
    },
    enabled: !!data?.professional,
  });

  const createAppointment = useMutation({
    mutationFn: async (slot: { date: Date; time: string }) => {
      if (data?.isOwner) {
        throw new Error("No puedes agendar un turno contigo mismo");
      }
      // Construct ISO datetime string from date + time
      const [h, m] = slot.time.split(":").map(Number);
      const dt = new Date(slot.date);
      dt.setHours(h, m, 0, 0);

      const res = await fetch(`${SERVER_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          professionalId,
          dateTime: dt.toISOString(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error al reservar");
      return json;
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedSlot(null);
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      alert("¡Turno reservado con éxito!");
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  if (isLoading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><div className="animate-spin text-blue-600 text-4xl material-symbols-outlined">progress_activity</div></div>;
  if (error) {
    const err = error as { status?: number; message?: string };
    // 403 is handled by useEffect redirect
    if (err.status === 403) return null;
    return <NotFoundScreen />;
  }
  if (!data?.professional) return <NotFoundScreen />;

  const prof = data.professional;
  const workingHours = prof.workingHours || {};
  const today = new Date();
  const monthLabel = format(weekStart, "MMMM yyyy", { locale: es });

  return (
    <div className="bg-[#f6f6f8] dark:bg-[#111621] text-[#0e121b] dark:text-slate-200 min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          {data.isPublic === false && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-8 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-300">
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span className="text-sm font-medium">
                {data.isOwner ? "Estás viendo tu perfil como lo verían tus pacientes" : `Estás viendo el perfil privado de ${prof.name}`}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-[#1a2233] rounded-2xl p-8 border border-[#e7ebf3] dark:border-gray-800 shadow-sm text-center lg:text-left sticky top-6">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 mb-6">
                  <div
                    className="w-32 h-32 rounded-2xl bg-cover bg-center shadow-lg shrink-0 bg-slate-200 dark:bg-slate-700"
                    style={{
                      backgroundImage: prof.image
                        ? `url("${prof.image}")`
                        : `url("https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name)}&size=256&background=2563EB&color=fff&bold=true")`,
                    }}
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-[#0e121b] dark:text-white mb-1">{prof.name}</h1>
                    <p className="text-[#4d6599] font-medium mb-3">
                      {prof.specialty}
                      {prof.licenseNumber && <span> • Mat. {prof.licenseNumber}</span>}
                    </p>
                    {prof.languages.length > 0 && (
                      <div className="flex flex-wrap justify-center lg:justify-start gap-2 text-sm">
                        {prof.languages.map((lang) => (
                          <span key={lang} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-semibold uppercase tracking-wide text-[#4d6599]">
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {prof.address && (
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-[#0e121b] dark:text-gray-300">
                      <span className="material-symbols-outlined text-blue-600">location_on</span>
                      <span>{prof.address}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-[#0e121b] dark:text-gray-300">
                    <span className="material-symbols-outlined text-blue-600">videocam</span>
                    <span>Consultas por video disponibles</span>
                  </div>
                  {prof.sessionPrice && (
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-[#0e121b] dark:text-gray-300">
                      <span className="material-symbols-outlined text-blue-600">payments</span>
                      <span className="font-semibold">
                        ${prof.sessionPrice} <span className="font-normal text-[#4d6599]">por sesión</span>
                      </span>
                    </div>
                  )}
                </div>

                {prof.bio && (
                  <div>
                    <h3 className="font-bold text-[#0e121b] dark:text-white mb-2">Acerca de</h3>
                    <p className="text-[#4d6599] leading-relaxed text-sm">{prof.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Calendar */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-[#1a2233] rounded-2xl border border-[#e7ebf3] dark:border-gray-800 shadow-lg overflow-hidden sticky top-6">

                {/* Calendar Header with Navigation */}
                <div className="p-6 border-b border-[#e7ebf3] dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-[#0e121b] dark:text-white">Seleccionar horario</h3>
                    <p className="text-[#4d6599] text-sm capitalize">{monthLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWeekOffset((p) => p - 1)}
                      disabled={weekOffset === 0 && isSameDay(startOfWeek(new Date(), { weekStartsOn: 1 }), weekStart)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button
                      onClick={() => setWeekOffset(0)}
                      className="text-sm font-semibold text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors capitalize"
                    >
                      {format(weekStart, "MMMM d", { locale: es })} - {format(addDays(weekStart, 6), "MMMM d", { locale: es })}
                    </button>
                    <button
                      onClick={() => setWeekOffset((p) => p + 1)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6 overflow-x-auto">
                  <div className="min-w-[500px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                      {weekDates.map((date, i) => {
                        const dayName = format(date, "EEE", { locale: es });
                        const dayNum = format(date, "d");
                        const isCurrentDay = isSameDay(date, today);

                        return (
                          <div key={i} className={`flex flex-col items-center p-2 rounded-xl border ${isCurrentDay ? "bg-blue-600 border-blue-600 text-white shadow-md transform scale-105" : "border-transparent text-slate-500"}`}>
                            <span className={`text-xs uppercase font-bold ${isCurrentDay ? "text-blue-100" : ""}`}>{dayName}</span>
                            <span className={`text-lg font-bold ${isCurrentDay ? "text-white" : "text-slate-900 dark:text-white"}`}>{dayNum}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Slots Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {isLoadingAppointments ? (
                        <div className="col-span-7 h-48 flex items-center justify-center">
                          <span className="material-symbols-outlined animate-spin text-slate-400">progress_activity</span>
                        </div>
                      ) : (
                        weekDates.map((date, i) => {
                          const dayKey = DAYS_ORDER[i];
                          const dayConfig = workingHours[dayKey];
                          const slots = dayConfig ? generateSlots(dayConfig.start, dayConfig.end) : [];

                          // Correctly calculate start of day for comparison
                          const startOfDayToday = new Date(today);
                          startOfDayToday.setHours(0, 0, 0, 0);
                          const startOfThisDate = new Date(date);
                          startOfThisDate.setHours(0, 0, 0, 0);

                          const isPastDay = isBefore(startOfThisDate, startOfDayToday);

                          const bookedSlots = new Set(
                            (appointmentData?.appointments || [])
                              .filter((appt) => isSameDay(parseISO(appt.dateTime), date))
                              .map((appt) => format(parseISO(appt.dateTime), "HH:mm"))
                          );

                          return (
                            <div key={i} className="flex flex-col gap-2 relative">
                              {/* Vertical Divider */}
                              {i > 0 && <div className="absolute -left-1 top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-800" />}

                              {slots.length === 0 || isPastDay ? (
                                <div className="h-full flex items-center justify-center py-8">
                                  <span className="text-xl text-slate-200 dark:text-slate-700 select-none">•</span>
                                </div>
                              ) : (
                                slots.map((time) => {
                                  // Check logic:
                                  // 1. Is it booked?
                                  // 2. Is it in the past (today + time)?
                                  // 3. Is it within anticipation window?
                                  const [h, m] = time.split(":").map(Number);
                                  const slotDate = new Date(date);
                                  slotDate.setHours(h, m, 0, 0);
                                  const now = new Date();

                                  const isBooked = bookedSlots.has(time);
                                  const isPastTime = isBefore(slotDate, now);
                                  const minAnticipationMs = prof.minAnticipationHours * 60 * 60 * 1000;
                                  const isTooSoon = slotDate.getTime() - now.getTime() < minAnticipationMs;

                                  const isDisabled = isBooked || isPastTime || isTooSoon || data?.isOwner;

                                  const isSelected = selectedSlot?.time === time && isSameDay(selectedSlot.date, date);

                                  let buttonClass = "w-full py-2 text-sm font-medium rounded-lg transition-all border ";
                                  if (isBooked) {
                                    buttonClass += "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border-transparent decoration-slice line-through";
                                  } else if (isPastTime) {
                                    buttonClass += "bg-white dark:bg-[#1a2233] text-slate-300 dark:text-slate-700 cursor-not-allowed border-transparent";
                                  } else if (isTooSoon) {
                                    buttonClass += "bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed border-dashed border-slate-200 dark:border-slate-700";
                                  } else if (isSelected) {
                                    buttonClass += "bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-600 transform scale-105 z-10";
                                  } else {
                                    buttonClass += "bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-transparent hover:shadow-sm";
                                  }

                                  return (
                                    <button
                                      key={time}
                                      disabled={isDisabled}
                                      onClick={() => setSelectedSlot({ date, time })}
                                      className={buttonClass}
                                      title={
                                        isBooked ? "Ocupado" :
                                          isPastTime ? "Horario pasado" :
                                            isTooSoon ? `Requiere ${prof.minAnticipationHours}h de anticipación` :
                                              data?.isOwner ? "Vista previa (Desactivado)" :
                                                "Disponible"
                                      }
                                    >
                                      {isBooked ? "Ocupado" : time}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-[#e7ebf3] dark:border-gray-800 bg-[#f6f6f8] dark:bg-[#1a2233]/50 flex justify-between items-center">
                  <div>
                    {selectedSlot ? (
                      <div>
                        <div className="text-xs font-semibold text-[#4d6599] uppercase tracking-wider">Seleccionado</div>
                        <div className="font-bold text-[#0e121b] dark:text-white capitalize">
                          {format(selectedSlot.date, "EEEE d", { locale: es })} • {selectedSlot.time}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400">Selecciona un horario para continuar</div>
                    )}
                  </div>
                  {data?.isOwner ? (
                    <div className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-default">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                      Vista previa del perfil
                    </div>
                  ) : (
                    <button
                      disabled={!selectedSlot}
                      onClick={() => setIsModalOpen(true)}
                      className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                      Agendar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          if (data?.isOwner) return;
          selectedSlot && createAppointment.mutate(selectedSlot);
        }}
        slot={selectedSlot}
        professional={prof}
        isPending={createAppointment.isPending}
      />

      <Footer />
    </div>
  );
}
