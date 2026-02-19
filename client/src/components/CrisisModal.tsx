
interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-red-600 p-6 text-white text-center">
          <div className="mx-auto size-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl">support_agent</span>
          </div>
          <h2 className="text-2xl font-bold">¿Necesitas ayuda urgente?</h2>
          <p className="text-red-100 mt-2 text-sm">Si estás en una situación de crisis, no estás solo. Hay ayuda disponible 24/7.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="size-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">call</span>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Emergencias Médicas</p>
              <p className="text-xl font-mono font-bold text-red-600">911</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="size-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">favorite</span>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Prevención del Suicidio</p>
              <p className="text-xl font-mono font-bold text-blue-600">135 / 0800-345-1435</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors mt-4 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
