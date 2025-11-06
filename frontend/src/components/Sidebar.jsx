import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants/categories';

export default function Sidebar({ open = false, onClose }) {
  const [productsOpen, setProductsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const goToCategory = (catId) => {
    const params = new URLSearchParams(location.search);
    if (catId === 'all') {
      params.delete('cat');
    } else {
      params.set('cat', catId);
    }
    navigate(`/shop?${params.toString()}`);
    if (onClose) onClose();
  };

  const itemBase = 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all';
  const itemInactive = 'text-secondary-700 hover:bg-primary-50 hover:text-primary-700';
  const itemActive = 'bg-primary-600 text-white shadow-sm';

  return (
    <aside
      className={`
        fixed top-16 left-0 z-50 h-[calc(100vh-64px)] w-72 bg-white border-r border-secondary-200 shadow-xl
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}
      aria-label="Menú lateral"
    >
      <nav className="p-6 space-y-8 overflow-y-auto h-full">
        <div>
          <p className="text-xs uppercase tracking-wider text-secondary-500 font-bold mb-4">Navegación</p>
          <ul className="space-y-2">
            <li>
              <NavLink to="/" className={({ isActive }) => `${itemBase} ${isActive ? itemActive : itemInactive}`}>
                <span className="material-symbols-outlined text-xl">home</span>
                Inicio
              </NavLink>
            </li>
            <li>
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className={`${itemBase} ${location.pathname.startsWith('/shop') ? itemActive : itemInactive} w-full justify-between`}
                aria-expanded={productsOpen}
                aria-controls="menu-products"
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">storefront</span>
                  Productos
                </span>
                <span className={`material-symbols-outlined text-lg transition-transform ${productsOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              {productsOpen && (
                <ul id="menu-products" className="mt-2 ml-10 space-y-1">
                  <li>
                    <button onClick={() => goToCategory('all')} className={`${itemBase} ${itemInactive} w-full justify-start text-xs`}>
                      Todos los Productos
                    </button>
                  </li>
                  {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                    <li key={cat.id}>
                      <button onClick={() => goToCategory(cat.id)} className={`${itemBase} ${itemInactive} w-full justify-start text-xs`}>
                        <span className="mr-1">{cat.icon}</span> {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <NavLink to="/faq" className={({ isActive }) => `${itemBase} ${isActive ? itemActive : itemInactive}`}>
                <span className="material-symbols-outlined text-xl">live_help</span>
                Preguntas Frecuentes
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `${itemBase} ${isActive ? itemActive : itemInactive}`}>
                <span className="material-symbols-outlined text-xl">info</span>
                Nosotros
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
