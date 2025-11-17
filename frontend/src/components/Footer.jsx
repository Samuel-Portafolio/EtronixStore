import { Link } from "react-router-dom";
import logo from "../assets/logoEtronix.webp";
import OptimizedImage from "./OptimizedImage";
import { Helmet } from "react-helmet-async";
import { SEO_CONFIG } from "../config/seo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": SEO_CONFIG.organization.name,
            "image": `${SEO_CONFIG.siteUrl}${SEO_CONFIG.organization.logo}`,
            "telephone": SEO_CONFIG.organization.phone,
            "email": SEO_CONFIG.organization.email,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": SEO_CONFIG.organization.address.addressLocality,
              "addressRegion": SEO_CONFIG.organization.address.addressRegion,
              "addressCountry": SEO_CONFIG.organization.address.addressCountry
            },
            "url": SEO_CONFIG.siteUrl,
            "priceRange": "$$",
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "08:00",
                "closes": "20:00"
              },
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "09:00",
                "closes": "18:00"
              }
            ]
          })}
        </script>
      </Helmet>
      
    <footer className="relative backdrop-blur-xl bg-gray-900/90 border-t border-white/10">
      {/* Línea superior con gradiente */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Logo y descripción - 2 columnas en lg */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-cyan-500/30 to-blue-500/30 rounded-xl blur-md" />
                <OptimizedImage src={logo} alt="Etronix Logo" className="relative h-20 w-auto rounded-xl bg-white/10 backdrop-blur-sm p-2" priority />
              </div>
              <div>
                <h2 className="text-2xl font-black bg-linear-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  ETRONIX
                </h2>
                <p className="text-xs text-gray-400 font-bold tracking-widest">TECHNOLOGY STORE</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-6 max-w-md">
              Líder en distribución de accesorios tecnológicos premium. Más de 5 años de experiencia
              ofreciendo productos de calidad con garantía y soporte especializado.
            </p>

            {/* Métodos de pago */}
            <div className="mb-6">
              <p className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wider">Métodos de Pago</p>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 backdrop-blur-md bg-white/10 rounded-lg border border-white/20 hover:border-cyan-400/50 transition-all">
                  <span className="text-xs font-black bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    MERCADO PAGO
                  </span>
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div>
              <p className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wider">Síguenos</p>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 backdrop-blur-md bg-white/10 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all border border-white/20 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/50 group"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 backdrop-blur-md bg-white/10 hover:bg-linear-to-br hover:from-purple-600 hover:to-pink-600 rounded-xl flex items-center justify-center transition-all border border-white/20 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/50 group"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                <a
                  href="https://wa.me/573207208410"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 backdrop-blur-md bg-white/10 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all border border-white/20 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/50 group"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="font-black text-white mb-4 text-sm uppercase tracking-wider">Categorías</h3>
            <ul className="space-y-3">
              {[
                { to: "/shop?cat=celulares", label: "Celulares" },
                { to: "/shop?cat=audifonos", label: "Audífonos" },
                { to: "/shop?cat=cargadores", label: "Cargadores" },
                { to: "/shop?cat=accesorios", label: "Accesorios" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    className="text-sm text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
                    to={item.to}
                  >
                    <span className="w-1.5 h-1.5 bg-white/20 group-hover:bg-cyan-400 rounded-full transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Información */}
          <div>
            <h3 className="font-black text-white mb-4 text-sm uppercase tracking-wider">Información</h3>
            <ul className="space-y-3">
              {[
                { to: "/about", label: "Nosotros" },
                { to: "/faq", label: "Preguntas Frecuentes" },
                { to: "#envios", label: "Envíos" },
                { to: "#garantias", label: "Garantías" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    className="text-sm text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
                    to={item.to}
                  >
                    <span className="w-1.5 h-1.5 bg-white/20 group-hover:bg-cyan-400 rounded-full transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-black text-white mb-4 text-sm uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@etronix.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+57 320 7208410</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p>Lun - Vie: 8AM - 8PM</p>
                  <p className="text-xs text-gray-400">Sáb: 9AM - 6PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear}{" "}
              <span className="font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Etronix Technology Store
              </span>
              . Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              {["Privacidad", "Términos", "Cookies"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
