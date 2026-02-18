

export function Features() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-brand-primary">Todo lo que necesitas</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Nada de lo que sobra</p>
          <p className="mt-6 text-lg leading-8 text-gray-600">Diseñado para mantener tu práctica privada y organizada, sin la complejidad de los directorios públicos.</p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-gray-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                Agendamiento Privado
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Tus pacientes solo reservan si tienen tu enlace. Sin perfiles públicos ni competencia innecesaria. Mantén el control total de quién accede a tu agenda.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-gray-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                Historia Clínica Simplificada
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Registros SOAP rápidos y seguros. Enfócate en la evolución subjetiva y el plan de tratamiento sin perder tiempo en burocracia innecesaria.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-gray-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                Pagos Flexibles
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Gestiona transferencias manuales o integra pagos en línea de forma sencilla y transparente. Automatiza recordatorios de cobro.</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
