import { Link, useLocation } from "react-router-dom";
import CartDrawer from "./CartDrawer";
import logoEtronix from "../assets/logoEtronix.webp";
import { useEffect, useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";

export default function Header() {
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-2 group relative z-10"
              >
                <img
                  src={logoEtronix}
                  alt="Logo Etronix"
                  className="w-16 h-16"
                />
                <span className="font-black text-xl bg-linear-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
                  ETRONIX
                </span>
              </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative font-bold text-sm transition-colors group ${
                    location.pathname === link.to
                      ? "text-cyan-400"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-0.5 bg-linear-to-r from-cyan-400 to-blue-500 transform origin-left transition-transform ${
                      location.pathname === link.to
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Cart */}
              <button
                type="button"
                className="relative group"
                aria-label="Carrito de compras"
                onClick={() => setCartDrawerOpen(true)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 p-2.5 rounded-full transition-all group-hover:border-cyan-400/50">
                    <ShoppingCart className="w-5 h-5 text-gray-300 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>

                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white text-xs font-black min-w-5 h-5 rounded-full flex items-center justify-center px-1.5 shadow-lg shadow-cyan-500/50 animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden relative group"
                aria-label="Abrir menú"
              >
                <div className="relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 p-2.5 rounded-full transition-all group-hover:border-cyan-400/50">
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5 text-gray-300 group-hover:text-cyan-400 transition-colors" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-300 group-hover:text-cyan-400 transition-colors" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Cart Drawer */}
      <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />

      {/* Mobile Menu con animación suave */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop con blur */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu panel */}
        <div
          className={`absolute top-16 right-4 left-4 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-cyan-500/10 transition-all duration-300 transform ${
            mobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0"
          }`}
        >
          <nav className="p-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-bold transition-all ${
                  location.pathname === link.to
                    ? "bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-400/30"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}