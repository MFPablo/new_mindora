
export function SignupBenefits() {
  return (
    <div className="lg:col-span-5 space-y-8 pt-4">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Tu camino hacia el bienestar comienza aquí.</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
          Mindora conecta pacientes con los mejores profesionales de salud mental. Gestiona citas, notas de terapia y seguimiento de progreso en un lugar seguro.
        </p>
      </div>
      <div className="space-y-6 pt-4">
        <div className="flex items-start gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
            <span className="material-symbols-outlined text-brand-primary text-xl">psychology</span>
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">Profesionales Expertos</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accede a una red de Psicólogos, Terapeutas del Habla y Terapeutas Ocupacionales certificados.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
            <span className="material-symbols-outlined text-brand-primary text-xl">lock_person</span>
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">Seguro y Confidencial</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Plataforma que cumple con HIPAA asegurando que tus datos permanezcan privados y protegidos.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
            <span className="material-symbols-outlined text-brand-primary text-xl">event_available</span>
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">Agenda Fácil</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reserva sesiones al instante con calendario de disponibilidad en tiempo real.</p>
          </div>
        </div>
      </div>
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
            <img alt="User avatar" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA8QLi-mqmRWlFTYyFR26ZxPiZ0H8LnfkZ4coYQvboKxqsJzlXWfCgs3MU1X6iUK73fsBzmLxOAvIGfQY0amroGsFPSlB9NvtcY7UTIa3khYzG8XtrHn_1sCEkmT2NEae0X9mjxTYzGMl2OauW58f00WtQjVg5-Hx6HzMDns3dXm4PMRJ1UN1d4mIWGTF7sSnqEk6k0UEVpCd8WXiJdPqhtK-1zyi0voG4146QBkqy_jIo9fAdN6FBOb9waOYD-7z7Ah16gbMIdAdK"/>
          </div>
          <div>
            <div className="flex text-yellow-400 text-xs mb-1">
              <span className="material-symbols-outlined text-sm">star</span>
              <span className="material-symbols-outlined text-sm">star</span>
              <span className="material-symbols-outlined text-sm">star</span>
              <span className="material-symbols-outlined text-sm">star</span>
              <span className="material-symbols-outlined text-sm">star</span>
            </div>
            <p className="text-sm italic text-gray-600 dark:text-gray-300">"Encontrar al terapeuta adecuado era intimidante hasta que encontré Mindora. El proceso fue increíblemente fluido."</p>
            <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">- Emily R.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
