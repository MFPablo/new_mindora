import { Link } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AccessDenied() {
  return (
    <div className="min-h-screen bg-background-light font-display flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-surface-light border border-border-color rounded-2xl shadow-xl p-10 flex flex-col items-center">
          <div className="size-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 animate-pulse">
            <span className="material-symbols-outlined text-4xl">lock</span>
          </div>
          <h1 className="text-text-main text-3xl font-black mb-4 tracking-tight">Acceso Denegado</h1>
          <p className="text-text-secondary text-base mb-8 leading-relaxed">
            No tienes los permisos necesarios para acceder a esta sección. Por favor, asegúrate de haber iniciado sesión con la cuenta correcta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link
              to="/"
              className="flex-1 bg-white border border-border-color text-text-main font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-all text-center"
            >
              Volver al Inicio
            </Link>
            <Link
              to="/login"
              className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all text-center"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
