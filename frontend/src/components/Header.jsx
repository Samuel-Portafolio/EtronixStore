import { Link, useLocation } from "react-router-dom";
import CartDrawer from "./CartDrawer";
import logoEtronix from "../assets/logoEtronix.webp";
import { useEffect, useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";

export default function Header({ onToggleSidebar }) {
  const location = useLocation();
  const [cart, setCart] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);

    const handleStorageChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(updatedCart);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/shop", label: "Tienda" },
    { to: "/about", label: "Nosotros" },
  ];

  return (
    <>
      {/* Header sticky con glassmorphism oscuro */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-white/10 transition-all duration-300 ${
          scrolled ? "shadow-xl shadow-cyan-500/5" : ""
        }`}
      >
        {/* lineare sutil en el borde inferior */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="flex items-center justify-between h-16">
            {/* Left: sidebar button */}
            <div className="flex items-center">
              <button
                type="button"
                className="relative group"
                aria-label="Abrir menú lateral"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onToggleSidebar === 'function') onToggleSidebar();
                }}
              >
                <div className="relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 p-2.5 rounded-full transition-all group-hover:border-cyan-400/50">
                  <Menu className="w-5 h-5 text-gray-300 group-hover:text-cyan-400 transition-colors" />
                </div>
              </button>
            </div>

            {/* Center: logo */}
            <div className="flex-1 flex items-center justify-center md:justify-start">
              <Link to="/" className="flex items-center gap-2 group relative z-10">
                <img src={logoEtronix} alt="Logo Etronix" className="hidden md:block md:w-[90px] md:h-[70px]" />
                <span className="block md:inline font-black text-xl bg-linear-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
                  ETRONIX
                </span>
              </Link>
              {/* Desktop Navigation (kept for md+) */}
              <nav className="hidden md:flex items-center gap-8 ml-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative font-bold text-sm transition-colors group ${location.pathname === link.to ? "text-cyan-400" : "text-gray-300 hover:text-white"}`}
                  >
                    {link.label}
                    <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-linear-to-r from-cyan-400 to-blue-500 transform origin-left transition-transform ${location.pathname === link.to ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right: actions (cart) */}
            <div className="flex items-center gap-4">
              <button type="button" className="relative group" aria-label="Carrito de compras" onClick={() => setCartDrawerOpen(true)}>
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 p-2.5 rounded-full transition-all group-hover:border-cyan-400/50">
                    <ShoppingCart className="w-5 h-5 text-gray-300 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white text-xs font-black min-w-5 h-5 rounded-full flex items-center justify-center px-1.5 shadow-lg shadow-cyan-500/50 animate-pulse">{totalItems}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Cart Drawer */}
      <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />

      {/* Mobile Menu con animación suave */}
      {/* Mobile menu removed: sidebar button (left) opens existing sidebar; no floating mobile menu */}
    </>
  );
}