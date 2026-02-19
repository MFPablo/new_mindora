
interface EmergencyCardProps {
  onOpenModal: () => void;
}

export function EmergencyCard({ onOpenModal }: EmergencyCardProps) {
  return (
    <div className="bg-[#1e1e4a] text-white p-6 rounded-3xl shadow-xl flex flex-col gap-4 relative overflow-hidden">
      {/* Accent Circle */}
      <div className="absolute -right-4 -top-4 size-24 bg-blue-500/10 rounded-full blur-2xl" />

      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white text-[22px]">support_agent</span>
        </div>
        <h3 className="font-bold text-base">¿Necesitas ayuda inmediata?</h3>
      </div>

      <p className="text-[11px] text-white/70 leading-normal">
        Si estás en crisis, por favor contacta a emergencias o a tu contacto designado de emergencia.
      </p>

      <button
        onClick={onOpenModal}
        className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold text-xs border border-white/5 cursor-pointer shadow-inner"
      >
        <span className="material-symbols-outlined text-[18px]">call</span>
        Ver Contactos de Emergencia
      </button>
    </div>
  );
}
