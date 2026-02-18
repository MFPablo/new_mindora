

export function TrustSection() {
  return (
    <section className="bg-white py-16 sm:py-24 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Confianza y Seguridad</h2>
          <p className="mt-4 text-lg text-gray-600">Construido con estándares de seguridad de grado médico para proteger la información más sensible.</p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-3 text-center">
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl">
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-4">encrypted</span>
            <h3 className="font-semibold text-gray-900">Encriptación de extremo a extremo</h3>
          </div>
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl">
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-4">shield</span>
            <h3 className="font-semibold text-gray-900">Cumplimiento de privacidad de datos</h3>
          </div>
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl">
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-4">cloud_done</span>
            <h3 className="font-semibold text-gray-900">Copias de seguridad diarias</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
