// frontend/src/components/Layout.jsx - MEJORAR

import { lazy, Suspense } from 'react';
import { useState } from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

// ✅ Lazy load TODOS los componentes no críticos
const Sidebar = lazy(() => import('./Sidebar'));
const CartDrawer = lazy(() => import('./CartDrawer'));
const Footer = lazy(() => import('./Footer'));

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header es crítico - no lazy */}
      <Header 
        onToggleSidebar={() => setSidebarOpen(true)}
        onToggleCart={() => setCartOpen(true)}
      />

      {/* ✅ Lazy load con Suspense */}
      <Suspense fallback={null}>
        {sidebarOpen && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      </Suspense>

      <Suspense fallback={null}>
        {cartOpen && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />}
      </Suspense>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer lazy */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}