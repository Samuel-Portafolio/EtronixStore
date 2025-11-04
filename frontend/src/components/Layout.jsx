import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CartDrawer from './CartDrawer';
import Footer from './Footer';
import Chatbot from './Chatbot';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <Header 
        onToggleSidebar={() => setSidebarOpen(true)}
        onToggleCart={() => setCartOpen(true)}
      />

      {/* Backdrop del drawer (no cubre el header) */}
      {sidebarOpen && (
        <div
          className="fixed left-0 right-0 top-16 bottom-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer lateral superpuesto (no afecta el layout) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
        <Footer />
      </main>

      <Chatbot />
    </div>
  );
}
