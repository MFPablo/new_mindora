

export function CtaSection() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-dark py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Empieza hoy mismo tu práctica digital.</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Únete a cientos de profesionales que ya gestionan su consulta de forma privada y eficiente con Mindora.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="#" className="rounded-lg bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Comenzar prueba gratis
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-white flex items-center gap-1">
              Hablar con ventas <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
