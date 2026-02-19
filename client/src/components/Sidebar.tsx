import { Link } from "@tanstack/react-router";

interface SidebarLink {
  icon: string;
  label: string;
  to: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  links: SidebarLink[];
  user: any;
  userRoleLabel: string;
  onLinkClick?: (view: string) => void;
}

export function Sidebar({ links, onLinkClick }: SidebarProps) {
  return (
    <aside className="group fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col z-40 w-20 hover:w-64 transition-all duration-300 ease-in-out overflow-hidden shadow-xl hover:shadow-2xl">
      <nav className="flex-1 px-3 space-y-2 mt-8 overflow-y-auto overflow-x-hidden pt-2">
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.to === '#' ? undefined : link.to}
            onClick={(e) => {
              if (link.onClick) {
                e.preventDefault();
                link.onClick();
              }
              if (onLinkClick && link.label === "Dashboard") onLinkClick("home");
              if (onLinkClick && link.label === "Mis Sesiones") onLinkClick("sessions");
            }}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group/link ${link.active
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600"
              }`}
          >
            <span className={`material-symbols-outlined text-[24px] shrink-0 transition-transform duration-300 ${!link.active && "group-hover/link:scale-110"}`}>
              {link.icon}
            </span>
            <span className="font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
              {link.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
