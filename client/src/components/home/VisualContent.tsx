

export function VisualContent() {
  return (
    <section className="py-24 bg-brand-light overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Gestión simplificada para profesionales</h2>
            <p className="text-lg leading-8 text-gray-600 mb-8">
              Herramientas potentes para llevar tu consulta al siguiente nivel. Mindora te permite enfocarte en lo que realmente importa: tus pacientes.
            </p>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <div>
                  <strong className="font-semibold text-gray-900">Expedientes Clínicos Seguros.</strong>
                  <span className="text-gray-600">Mantén un registro ordenado y encriptado de cada sesión.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <div>
                  <strong className="font-semibold text-gray-900">Enlaces Privados.</strong>
                  <span className="text-gray-600">Comparte tu disponibilidad solo con quien tú elijas, sin exposiciones públicas.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <div>
                  <strong className="font-semibold text-gray-900">Recordatorios Automáticos.</strong>
                  <span className="text-gray-600">Reduce el ausentismo con notificaciones automáticas por correo y SMS.</span>
                </div>
              </li>
            </ul>
            <div className="mt-10">
              <a href="#" className="text-sm font-semibold leading-6 text-brand-primary flex items-center gap-1 hover:gap-2 transition-all">
                Ver todas las características <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="relative">
            {/* Abstract UI Representation */}
            <div className="relative rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="rounded-lg bg-white shadow-2xl ring-1 ring-gray-900/10 overflow-hidden">
                {/* Placeholder for App UI */}
                <div className="aspect-[16/10] w-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBZFwvZ20rI-320N_b-or20XIeQEbR87DS_UHF5Ne407SCgRhKvN3HN_J78VZ_A7A1wT3YYreg55RsEuGdfSIOZrGmkHp5nZ6_mfTlFngqhNlbo3PWV-xx-T69mRwWw42r10nJpCMLKoNw3Wppwt-_mTnXsN5Btdz7UVAPCqmKaUWIQFsKk4WTevpbmFSpJFIMHMwo0u00nLvprCtO53HG4wh-PyPvjo34WgfbQ7S5eEj5Zo55uNgNjHRnzZChFm3Uhrp7EcgCS9ux2')" }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-8">
                    <div className="text-white">
                      <p className="font-bold text-lg">Panel de Control</p>
                      <p className="text-sm opacity-90">Vista rápida de tus próximas citas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
