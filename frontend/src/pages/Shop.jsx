import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
// import { CATEGORIES } from "../constants/categories";
import { NoResults, ProductSkeleton } from "../components/EmptyState";
import { Helmet } from "react-helmet-async";
import OptimizedImage from '../components/OptimizedImage';


export default function Shop() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;
  const paginatedProducts = filteredProducts.slice(0, page * PRODUCTS_PER_PAGE);
   const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 999999999 });
  const [tempPriceRange, setTempPriceRange] = useState({ min: '', max: '' }); 

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await res.json();
        // Asegura que data sea un array
        const productsArray = Array.isArray(data) ? data : [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
        // Limpiar carrito si no hay productos
        if (productsArray.length === 0) {
          localStorage.removeItem('cart');
        } else {
          // Si hay productos, filtrar el carrito para que solo tenga productos existentes
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          const validIds = new Set(productsArray.map(p => p._id));
          const filteredCart = cart.filter(item => validIds.has(item._id));
          localStorage.setItem('cart', JSON.stringify(filteredCart));
        }
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProducts([]);
        setFilteredProducts([]);
        localStorage.removeItem('cart');
      } finally {
        setLoading(false);
      }
    })();

    // const params = new URLSearchParams(location.search);
    // const cat = params.get('cat');
    // if (cat) setSelectedCategory(cat);
  }, [location.search]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    let filtered = products;

    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.specs?.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
    setPage(1); // Reinicia la paginación al filtrar
  }, [debouncedQuery, products]);

  const addToCart = (p) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const found = cart.find((x) => x._id === p._id);

    if (found) {
      found.quantity += 1;
    } else {
      cart.push({ ...p, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setToast('Producto agregado al carrito');
    setTimeout(() => setToast(""), 1800);
  };
  const priceStats = products.length > 0 ? {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  } : { min: 0, max: 1000000 };
  useEffect(() => {
    let filtered = products;

    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.specs?.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // 🆕 Filtro por rango de precio
    filtered = filtered.filter(p => 
      p.price >= priceRange.min && p.price <= priceRange.max
    );

    // 🆕 Ordenamiento
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'popular':
        // Aquí podrías ordenar por ventas si tienes ese dato
        filtered.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }

    setFilteredProducts(filtered);
    setPage(1);
  }, [debouncedQuery, products, sortBy, priceRange]);

  // 🆕 Aplicar filtro de precio
  const applyPriceFilter = () => {
    const min = tempPriceRange.min === '' ? 0 : Number(tempPriceRange.min);
    const max = tempPriceRange.max === '' ? 999999999 : Number(tempPriceRange.max);
    
    if (min > max) {
      alert('El precio mínimo no puede ser mayor al máximo');
      return;
    }
    
    setPriceRange({ min, max });
  };

  // 🆕 Limpiar filtro de precio
  const clearPriceFilter = () => {
    setTempPriceRange({ min: '', max: '' });
    setPriceRange({ min: 0, max: 999999999 });
  };

  return (
    <>
      <Helmet>
        <title>Tienda de Accesorios | Etronix Store</title>
        <meta name="description" content="Explora nuestro catálogo completo de accesorios tecnológicos: audífonos, cargadores, cables, protectores y más. Envío a toda Colombia." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Tienda | Etronix Store" />
        <meta property="og:description" content="Compra accesorios y tecnología premium en Colombia. Garantía, envíos rápidos y atención personalizada." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://etronix-store.com/shop" />
        <meta property="og:image" content={'https://etronix-store.com/logo.png'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tienda | Etronix Store" />
        <meta name="twitter:description" content="Compra accesorios y tecnología premium en Colombia. Garantía, envíos rápidos y atención personalizada." />
        <meta name="twitter:image" content={'https://etronix-store.com/logo.png'} />
        <link rel="canonical" href="https://etronix-store.com/shop" />
      </Helmet>
      // ...existing code...

      {/* === Fondo LightRays: ocupa toda la pantalla === */}
      <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-br from-gray-900 via-slate-900 to-black">
        
      </div>

      <div className="relative min-h-screen flex flex-col z-10">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            {/* Header con Título y Búsqueda */}
            <div className="mb-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-4xl font-black text-white mb-3">
                    Catálogo de Productos
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Explora nuestra selección completa de accesorios tecnológicos
                  </p>
                </div>

                {/* Barra de Búsqueda */}
                <div className="relative w-full md:w-96">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/10 -border-2 border-white/20 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none text-white placeholder-gray-400 font-medium"
                      />
                      <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white font-bold transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 🆕 Barra de Ordenamiento y Filtros */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Ordenar por */}
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-cyan-400/50 transition-all outline-none text-white font-medium"
                  >
                    <option value="newest" className="bg-gray-900">Más recientes</option>
                    <option value="price-asc" className="bg-gray-900">Precio: Menor a Mayor</option>
                    <option value="price-desc" className="bg-gray-900">Precio: Mayor a Menor</option>
                    <option value="name-asc" className="bg-gray-900">Nombre: A-Z</option>
                    <option value="name-desc" className="bg-gray-900">Nombre: Z-A</option>
                    <option value="popular" className="bg-gray-900">Más Populares</option>
                  </select>
                </div>

                {/* Filtro de Precio */}
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Rango de Precio
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={`Min $${priceStats.min.toLocaleString('es-CO')}`}
                      value={tempPriceRange.min}
                      onChange={(e) => setTempPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-cyan-400/50 transition-all outline-none text-white font-medium"
                    />
                    <input
                      type="number"
                      placeholder={`Max $${priceStats.max.toLocaleString('es-CO')}`}
                      value={tempPriceRange.max}
                      onChange={(e) => setTempPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-cyan-400/50 transition-all outline-none text-white font-medium"
                    />
                    <button
                      onClick={applyPriceFilter}
                      className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-black hover:bg-cyan-400 transition-all"
                    >
                      Filtrar
                    </button>
                  </div>
                </div>
              </div>

              {/* ...existing code... */}

              {/* ...existing code... */}
            </div>

            <div className="flex gap-8">

              {/* ...existing code... */}

              {/* Productos */}
              <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <ProductSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <NoResults
                    onClear={() => {
                      setSearchQuery('');
                      setDebouncedQuery('');
                      setSelectedCategory('all');
                    }}
                  />
                ) : (
                  <>
                    {/* Contador de resultados */}
                    <div className="mb-6 flex items-center justify-between">
                      <p className="text-sm text-gray-300 font-medium">
                        Mostrando <span className="font-black text-cyan-400">{paginatedProducts.length}</span> {paginatedProducts.length === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedProducts.map((p) => (
                        <Link
                          key={p._id}
                          to={`/products/${p._id}`}
                          className="bg-linear-to-br from-white/15 to-white/5 rounded-2xl border border-white/20 hover:border-cyan-400/50 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 overflow-hidden group flex flex-col hover:-translate-y-1 cursor-pointer"
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <div className="relative aspect-square bg-white/5 overflow-hidden">
                            {/* Badge de stock */}
                            {p.stock > 0 && p.stock < 5 && (
                              <span className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-black shadow-lg">
                                Últimas unidades
                              </span>
                            )}
                              {p.image ? (
                                <OptimizedImage
                                  src={p.image}
                                  alt={p.title ? `${p.title} - ${p.category}` : 'Producto Etronix'}
                                  width={400}
                                  height={400}
                                  decoding="async"
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-opacity duration-300"
                                  style={{ background: '#e0e7ef' }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-cyan-100">
                                  <span className="text-gray-400 text-4xl">📱</span>
                                </div>
                              )}
                          </div>

                          <div className="p-6 flex flex-col flex-1">
                            <div className="flex-1">
                              {p.category && (
                                <span className="inline-block px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-black mb-3">
                                  {p.category}
                                </span>
                              )}
                              <h3 className="font-black text-xl mb-2 text-white line-clamp-2">
                                {p.title}
                              </h3>
                              {p.description && (
                                <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                                  {p.description}
                                </p>
                              )}
                              <div className="flex items-baseline justify-between mb-5 pb-4 border-b border-white/10">
                                <p className="text-2xl font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                  ${p.price.toLocaleString("es-CO")}
                                </p>
                                <p className={`text-sm font-black ${p.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <button
                                onClick={e => { e.preventDefault(); addToCart(p); }}
                                disabled={p.stock === 0}
                                className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-white py-3.5 font-black hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-0.5"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {p.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                              </button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {/* Botón para cargar más productos */}
                    {paginatedProducts.length < filteredProducts.length && (
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={() => setPage(page + 1)}
                          className="px-8 py-4 rounded-xl bg-cyan-500 text-white font-black shadow-lg hover:bg-cyan-400 transition-all"
                        >
                          Cargar más productos
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-50 bg-linear-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl shadow-green-500/50 flex items-center gap-3 border border-green-400/50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-black">{toast}</span>
          </div>
        )}
      </div>
    </>
  );
}
