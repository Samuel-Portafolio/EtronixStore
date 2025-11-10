import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logoEtronixBordesRedondos.svg";

export default function Header({ cartCount: cartCountProp, onToggleSidebar, onToggleCart }) {
  const [cartCount, setCartCount] = useState(cartCountProp ?? 0);
  const [query, setQuery] = useState("");

  // Sincroniza el carrito con localStorage y eventos custom
  useEffect(() => {
    const readCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalItems = cart.reduce((a, i) => a + (i.quantity || 0), 0);
        setCartCount(totalItems);
      } catch {
        setCartCount(0);
      }
    };
    readCart();
    const onStorage = (e) => e.key === "cart" && readCart();
    const onCustom = () => readCart();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cartUpdated", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cartUpdated", onCustom);
    };
  }, []);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `/shop?search=${encodeURIComponent(query.trim())}`;
  };

  return (
    <>
      {/* Header sticky con glassmorphism oscuro */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-white/10 shadow-lg shadow-black/20">
        {/* Línea inferior con gradiente cyan */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 grid grid-cols-[auto_1fr_auto] items-center gap-6">
            {/* Izquierda: menú + marca */}
            <div className="flex items-center gap-4">
              <button
                onClick={onToggleSidebar}
                className="group relative p-2.5 rounded-xl border border-white/20 hover:border-cyan-400/50 transition-all bg-white/5 hover:bg-white/10 backdrop-blur-sm"
                aria-label="Abrir menú"
              >
                <svg className="w-6 h-6 text-gray-300 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-r from-cyan-500/30 to-blue-500/30 rounded-xl blur-md" />
                  <img src={logo} alt="Etronix" className="relative h-10 w-auto rounded-xl bg-white/10 backdrop-blur-sm p-1" loading="eager" decoding="async" />
                </div>
                <div className="hidden md:block leading-tight">
                  <span className="text-2xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    ETRONIX
                  </span>
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest">TECHNOLOGY STORE</p>
                </div>
              </Link>
            </div>

            {/* Centro: navegación + buscador */}
            <div className="flex items-center justify-left gap-6">
              {/* Nav PC */}
              <nav className="hidden lg:flex items-center gap-6">
                {[
                  { to: "/", label: "Inicio" },
                  { to: "/shop", label: "Catálogo" },
                  { to: "/offers", label: "Ofertas" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="relative text-sm font-bold text-gray-300 hover:text-white transition-colors group"
                  >
                    <span>{item.label}</span>
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-linear-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </nav>

              {/* Search con efecto glassmorphism */}
              <form onSubmit={onSearchSubmit} className="hidden md:block min-w-[340px]">
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 group-hover:border-cyan-400/50 transition-all">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      type="search"
                      placeholder="Buscar productos (Ctrl /)"
                      className="w-full bg-transparent placeholder-gray-400 text-white text-sm focus:outline-none"
                      aria-label="Buscar productos"
                    />
                    <kbd className="hidden lg:inline-flex items-center gap-1 rounded-md bg-white/10 border border-white/20 px-2 py-0.5 text-[10px] font-medium text-gray-300">
                      Ctrl <span>/</span>
                    </kbd>
                  </div>
                </div>
              </form>
            </div>

            {/* Derecha: acciones */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* WhatsApp con gradiente verde brillante */}
              <a
                href="https://wa.me/573207208410"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-green-500/50 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400"
                aria-label="Abrir WhatsApp de soporte"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
                <span>Soporte</span>
              </a>

              {/* Carrito con efecto glassmorphism */}
              <button
                onClick={onToggleCart}
                className="relative rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-2.5 hover:border-cyan-400/50 hover:bg-white/10 transition-all group"
                aria-label="Ver carrito"
              >
                <svg className="w-6 h-6 text-gray-300 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-black text-white bg-linear-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50 animate-pulse">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Atajo de teclado */}
      <ScriptlessHotkey
        onPress={() => {
          const el = document.querySelector('input[placeholder*="Buscar productos"]');
          if (el) el.focus();
        }}
      />
    </>
  );
}

function ScriptlessHotkey({ onPress }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        onPress?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPress]);
  return null;
}
