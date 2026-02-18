
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="relative isolate pt-14 lg:pt-20 pb-20 overflow-hidden">
      {/* Decorative background elements */}
      <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-brand-primary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 bg-white/50 backdrop-blur-sm">
              Nuevo: Pagos en línea integrados. <a href="#" className="font-semibold text-brand-primary"><span aria-hidden="true" className="absolute inset-0"></span>Leer más <span aria-hidden="true">→</span></a>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#0e0e1b] sm:text-6xl mb-6">
            Mindora: Tu espacio de salud, <span className="text-brand-primary">organizado</span> y <span className="text-brand-secondary">privado</span>
          </h1>
          <p className="text-lg leading-8 text-gray-600 mb-10">
            La plataforma que conecta terapeutas y pacientes sin intermediarios públicos. Gestión clínica simple, reservas privadas y una experiencia segura para todos.
          </p>
          {/* Dual CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Professional Path */}
            <div className="group relative flex flex-col items-start gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-brand-primary/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">medical_services</span>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Soy Profesional</h3>
                <p className="mt-1 text-sm text-gray-500">Gestión de historias clínicas, agenda y enlaces privados.</p>
              </div>
                <Link to="/signup" className="mt-2 text-sm font-semibold text-brand-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Acceso Profesional <span aria-hidden="true">→</span>
                </Link>
            </div>
            {/* Patient Path */}
            <div className="group relative flex flex-col items-start gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-brand-secondary/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-secondary/10 text-brand-secondary group-hover:bg-brand-secondary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Soy Paciente</h3>
                <p className="mt-1 text-sm text-gray-500">Reserva citas, gestiona tus sesiones y accede a recursos.</p>
              </div>
                <Link to="/signup" className="mt-2 text-sm font-semibold text-brand-secondary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Acceso Paciente <span aria-hidden="true">→</span>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
