import { useState, lazy, Suspense } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CartDrawer from './CartDrawer';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

// ✅ OPTIMIZACIÓN: Chatbot 100% lazy
const Chatbot = lazy(() => import('./Chatbot'));

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <Header 
        onToggleSidebar={() => setSidebarOpen(true)}
        onToggleCart={() => setCartOpen(true)}
      />

      {/* Backdrop del drawer */}
      {sidebarOpen && (
        <div
          className="fixed left-0 right-0 top-16 bottom-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 min-w-0">
        <Outlet />
        <Footer />
      </main>

      {/* ✅ Chatbot con lazy loading completo */}
      {!chatVisible && (
        <button
          onClick={() => setChatVisible(true)}
          onMouseEnter={() => {
            // ✅ Prefetch on hover
            import('./Chatbot').catch(() => {});
          }}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full shadow-2xl shadow-cyan-500/50 flex items-center justify-center hover:scale-110 transition-all duration-300 z-50"
          aria-label="Abrir chat"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C11.45 2 11 2.45 11 3V4.07C8.69 4.38 6.92 6.15 6.61 8.46L5 8.46C4.45 8.46 4 8.91 4 9.46V12.54C4 13.09 4.45 13.54 5 13.54H6.61C6.92 15.85 8.69 17.62 11 17.93V20H9C8.45 20 8 20.45 8 21C8 21.55 8.45 22 9 22H15C15.55 22 16 21.55 16 21C16 20.45 15.55 20 15 20H13V17.93C15.31 17.62 17.08 15.85 17.39 13.54H19C19.55 13.54 20 13.09 20 12.54V9.46C20 8.91 19.55 8.46 19 8.46H17.39C17.08 6.15 15.31 4.38 13 4.07V3C13 2.45 12.55 2 12 2M12 6C14.21 6 16 7.79 16 10V13C16 15.21 14.21 17 12 17C9.79 17 8 15.21 8 13V10C8 7.79 9.79 6 12 6M10 10C9.45 10 9 10.45 9 11C9 11.55 9.45 12 10 12C10.55 12 11 11.55 11 11C11 10.45 10.55 10 10 10M14 10C13.45 10 13 10.45 13 11C13 11.55 13.45 12 14 12C14.55 12 15 11.55 15 11C15 10.45 14.55 10 14 10Z"/>
          </svg>
          <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30"></span>
        </button>
      )}

      {/* ✅ Solo cargar Chatbot cuando el usuario lo abre */}
      {chatVisible && (
        <Suspense fallback={null}>
          <Chatbot 
            startOpen={true} 
            onClose={() => setChatVisible(false)} 
          />
        </Suspense>
      )}
    </div>
  );
}