import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export function Navbar() {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/auth/session`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    staleTime: 5000, // Reduced to see changes faster
  });

  const isLoggedIn = session?.user?.email;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-color bg-surface-light/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <span className="material-symbols-outlined text-[20px]">spa</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-text-main">Mindora</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {!isLoggedIn && (
            <>
              <Link to="/" className="text-sm font-medium text-text-secondary hover:text-blue-600 transition-colors">
                Para Terapeutas
              </Link>
              <Link to="/" className="text-sm font-medium text-text-secondary hover:text-blue-600 transition-colors">
                Para Pacientes
              </Link>
              <Link to="/pricing" className="text-sm font-medium text-text-secondary hover:text-blue-600 transition-colors">
                Precios
              </Link>
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <LoggedInSection session={session} />
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="hidden sm:flex text-gray-700 hover:bg-gray-100">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Empezar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function LoggedInSection({ session }: { session: any }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const user = session?.user;
  console.log("Navbar session user:", user);
  const displayName = user?.name || user?.email || "Usuario";
  const initials = displayName.charAt(0).toUpperCase() || "?";
  const avatarImage = user?.image;
  const userRole = user?.role === "admin"
    ? "Administrador"
    : user?.role === "professional"
      ? "Profesional"
      : "Paciente";

  const handleLogout = async () => {
    await fetch(`${SERVER_URL}/api/logout`, { method: "POST", credentials: "include" });
    window.location.href = "/";
  };

  return (
    <div className="flex items-center gap-4">
      {/* Notifications */}
      <button className="flex items-center justify-center rounded-full size-10 hover:bg-primary-light text-text-secondary hover:text-blue-600 transition-colors">
        <span className="material-symbols-outlined">notifications</span>
      </button>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 pl-4 border-l border-border-color outline-none group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-text-main group-hover:text-blue-600 transition-colors">{displayName}</p>
            <p className="text-xs text-text-secondary">{userRole}</p>
          </div>
          {avatarImage ? (
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-blue-600/20 group-hover:border-blue-600 transition-all"
              style={{ backgroundImage: `url("${avatarImage}")` }}
            />
          ) : (
            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 border-2 border-blue-600/20 group-hover:border-blue-600 transition-all">
              {initials}
            </div>
          )}
          <span className="material-symbols-outlined text-text-secondary text-sm group-hover:text-blue-600 transition-colors">
            {dropdownOpen ? "expand_less" : "expand_more"}
          </span>
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface-light rounded-lg shadow-lg border border-border-color py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
            <Link
              to="/profile"
              onClick={() => setDropdownOpen(false)}
              activeProps={{ className: "text-blue-600 font-bold bg-blue-50/50" }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-main hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">person</span>
              Mi Perfil
            </Link>
            {user?.role === "professional" && (
              <Link
                to="/dashboard/professional"
                onClick={() => setDropdownOpen(false)}
                activeProps={{ className: "text-blue-600 font-bold bg-blue-50/50" }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-main hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                Panel Profesional
              </Link>
            )}
            <a
              href="#"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-main hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">calendar_month</span>
              Mis Sesiones
            </a>
            <div className="border-t border-border-color my-1" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
