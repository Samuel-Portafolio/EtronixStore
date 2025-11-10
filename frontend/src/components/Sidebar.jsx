import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { CATEGORIES } from "../constants/categories";

export default function Sidebar({ open = false, onClose }) {
  const [productsOpen, setProductsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Cerrar si cambia de ruta
  useEffect(() => {
    if (open) onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const goToCategory = (catId) => {
    const params = new URLSearchParams(location.search);
    if (catId === "all") {
      params.delete("cat");
    } else {
      params.set("cat", catId);
    }
    navigate(`/shop?${params.toString()}`);
    onClose?.();
  };

  const itemBase =
    "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40";
  const itemInactive =
    "text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20";
  const itemActive =
    "text-white bg-linear-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30";

  return (
    <>
      {/* Overlay con blur */}
      <div
        className={`
          fixed inset-0 z-40 transition-opacity duration-300
          ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}
        `}
        aria-hidden="true"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-80 max-w-[92vw]
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Menú lateral"
        role="dialog"
        aria-modal="true"
      >
        {/* Panel con glassmorphism */}
        <div
          ref={panelRef}
          className="flex h-full flex-col backdrop-blur-2xl bg-gray-900/95 border-r border-white/10 shadow-2xl"
        >
          {/* Header del panel */}
          <div className="relative px-6 py-5 border-b border-white/10">
            {/* Línea gradiente decorativa */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-r from-cyan-500/30 to-blue-500/30 rounded-lg blur-md" />
                  <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 border border-white/20">
                    <span className="material-symbols-outlined text-[24px] text-cyan-400">menu</span>
                  </span>
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Menú
                  </p>
                  <h2 className="text-base font-black bg-linear-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Navegación
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:border-cyan-400/50 transition-all"
                aria-label="Cerrar menú"
              >
                <span className="material-symbols-outlined text-[22px] text-gray-300">close</span>
              </button>
            </div>
          </div>

          {/* Scroll area */}
          <nav className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
            <div className="px-5 py-6 space-y-8">
              {/* Bloque: Navegación */}
              <section>
                <HeaderLabel title="Navegación" />
                <ul className="mt-3 space-y-2">
                  <li>
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        `${itemBase} ${isActive ? itemActive : itemInactive}`
                      }
                    >
                      <span className="material-symbols-outlined text-xl">home</span>
                      <span>Inicio</span>
                    </NavLink>
                  </li>

                  <li className="space-y-2">
                    {/* Botón principal productos */}
                    <button
                      onClick={() => setProductsOpen((s) => !s)}
                      className={`${itemBase} w-full justify-between ${
                        location.pathname.startsWith("/shop") ? itemActive : itemInactive
                      }`}
                      aria-expanded={productsOpen}
                      aria-controls="menu-products"
                    >
                      <span className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-xl">storefront</span>
                        <span>Productos</span>
                      </span>
                      <span
                        className={`material-symbols-outlined text-lg transition-transform ${
                          productsOpen ? "rotate-180" : ""
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    {/* Submenú con colapso suave */}
                    <div
                      id="menu-products"
                      className={`
                        overflow-hidden transition-[grid-template-rows,opacity] duration-300
                        ${productsOpen ? "opacity-100" : "opacity-0"}
                      `}
                      style={{
                        display: "grid",
                        gridTemplateRows: productsOpen ? "1fr" : "0fr",
                      }}
                    >
                      <ul className="min-h-0 pl-3">
                        <li className="mt-2">
                          <button
                            onClick={() => goToCategory("all")}
                            className={`${itemBase} ${itemInactive} w-full justify-start text-[13px]`}
                          >
                            <span className="material-symbols-outlined text-[18px] text-gray-400">
                              apps
                            </span>
                            Todos los productos
                          </button>
                        </li>
                        {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                          <li key={cat.id}>
                            <button
                              onClick={() => goToCategory(cat.id)}
                              className={`${itemBase} ${itemInactive} w-full justify-start text-[13px]`}
                            >
                              <span className="mr-1">{cat.icon}</span>
                              {cat.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>

                  <li>
                    <NavLink
                      to="/faq"
                      className={({ isActive }) =>
                        `${itemBase} ${isActive ? itemActive : itemInactive}`
                      }
                    >
                      <span className="material-symbols-outlined text-xl">live_help</span>
                      <span>Preguntas Frecuentes</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/about"
                      className={({ isActive }) =>
                        `${itemBase} ${isActive ? itemActive : itemInactive}`
                      }
                    >
                      <span className="material-symbols-outlined text-xl">info</span>
                      <span>Nosotros</span>
                    </NavLink>
                  </li>
                </ul>
              </section>

              {/* Línea decorativa */}
              <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

              {/* Bloque: Atajos útiles */}
              <section>
                <HeaderLabel title="Atajos útiles" />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <QuickLink
                    to="/support"
                    icon="support_agent"
                    label="Soporte"
                    gradient="from-emerald-500 to-green-500"
                  />
                  <QuickLink
                    to="/shop"
                    icon="shopping_bag"
                    label="Tienda"
                    gradient="from-cyan-500 to-blue-500"
                  />
                </div>
              </section>
            </div>
          </nav>

          {/* Footer CTA WhatsApp */}
          <div className="px-5 py-4 border-t border-white/10">
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-green-500/30 to-emerald-500/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <a
                href="https://wa.me/573207208410"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center justify-between rounded-xl backdrop-blur-md bg-linear-to-r from-green-500 to-emerald-500 px-4 py-3 hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg hover:shadow-green-500/50"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                    <span className="material-symbols-outlined text-[20px] text-white">chat</span>
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-black text-white">¿Necesitas ayuda?</p>
                    <p className="text-[11px] font-bold tracking-wide text-white/80">
                      WhatsApp disponible
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] text-white">north_east</span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Estilos para scrollbar personalizada */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.5);
        }
      `}</style>
    </>
  );
}

/* ---------- Subcomponentes ---------- */

function HeaderLabel({ title }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-5 w-1 rounded-full bg-linear-to-b from-cyan-500 to-blue-500" />
      <p className="text-xs uppercase tracking-wider text-gray-400 font-black">{title}</p>
    </div>
  );
}

function QuickLink({ to, icon, label, gradient = "from-cyan-500 to-blue-500" }) {
  return (
    <Link
      to={to}
      className={`
        group rounded-xl backdrop-blur-md bg-white/10 border border-white/20
        hover:bg-linear-to-r hover:${gradient} hover:border-transparent
        transition-all hover:-translate-y-0.5 hover:shadow-lg
      `}
    >
      <div className="flex flex-col items-center gap-2 px-3 py-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
          <span className="material-symbols-outlined text-[22px] text-gray-300 group-hover:text-white transition-colors">{icon}</span>
        </span>
        <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors text-center">{label}</span>
      </div>
    </Link>
  );
}
