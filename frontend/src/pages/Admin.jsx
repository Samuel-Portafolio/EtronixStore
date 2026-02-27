import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AdminLogin from "../components/AdminLogin";
import { Helmet } from "react-helmet-async";
import LightRays from "../components/LightRays";
import ProductAdmin from "../components/ProductAdmin";
import AdminDashboard from "../components/AdminDashboard";

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const audioRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [view, setView] = useState("dashboard");

  useEffect(() => {
    const code = localStorage.getItem("adminCode") || "";
    const loginTime = parseInt(localStorage.getItem("adminLoginTime"), 10) || 0;
    const now = Date.now();
    const maxSession = 60 * 60 * 1000; 
    if (code && loginTime && now - loginTime < maxSession) {
      setAdminCode(code);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("adminCode");
      localStorage.removeItem("adminLoginTime");
      setIsAuthenticated(false);
      setAdminCode("");
    }
    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = (code) => {
    setAdminCode(code);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminCode");
    localStorage.removeItem("adminLoginTime");
    setIsAuthenticated(false);
    setAdminCode("");
    setOrders([]);
  };

  const fetchOrders = async () => {
    if (!adminCode) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        headers: { "x-admin-code": adminCode },
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      const data = await res.json();
      const ordersList = data.orders || data;

      if (lastOrderCount > 0 && ordersList.length > lastOrderCount) {
        if (audioRef.current) audioRef.current.play().catch(() => {});
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("¡Nuevo pedido!", {
            body: `Tienes ${ordersList.length - lastOrderCount} pedido(s) nuevo(s)`,
            icon: "/favicon.ico",
          });
        }
      }
      setOrders(ordersList);
      setLastOrderCount(ordersList.length);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 120000);
    return () => clearInterval(interval);
  }, [isAuthenticated, adminCode]);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!adminCode) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-code": adminCode },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      } else {
        alert("Error actualizando el estado");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    paid: "bg-green-500/20 text-green-300 border-green-500/30",
    failed: "bg-red-500/20 text-red-300 border-red-500/30",
    processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    shipped: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    delivered: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  };

  const statusLabels = {
    pending: "Pendiente", paid: "Pagado", failed: "Fallido",
    processing: "Procesando", shipped: "Enviado", delivered: "Entregado",
  };

  const filteredOrders = orders.filter((o) => filter === "all" ? true : o.status === filter);

  const orderStats = [
    { label: "Total", value: orders.length, color: "from-gray-400 to-gray-600", icon: "summarize" },
    { label: "Pendientes", value: orders.filter(o => o.status === "pending").length, color: "from-yellow-400 to-yellow-600", icon: "pending" },
    { label: "Pagados", value: orders.filter(o => o.status === "paid").length, color: "from-green-400 to-green-600", icon: "paid" },
    { label: "Procesando", value: orders.filter(o => o.status === "processing").length, color: "from-blue-400 to-blue-600", icon: "sync" },
    { label: "Enviados", value: orders.filter(o => o.status === "shipped").length, color: "from-purple-400 to-purple-600", icon: "local_shipping" },
    { label: "Entregados", value: orders.filter(o => o.status === "delivered").length, color: "from-teal-400 to-teal-600", icon: "check_circle" },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Helmet><title>Acceso Admin | Etronix</title></Helmet>
        <div className="absolute inset-0 z-0">
            <LightRays raysColor="#00d4ff" raysSpeed={1.5} className="opacity-50" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Helmet><title>Panel Admin | Etronix</title></Helmet>
      
      {/* Estilo para ocultar scrollbars */}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* Contenido Principal con padding superior para compensar la falta de header */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Selector de Vista (Navegación Simple sin Header) */}
        <nav className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2 border-b border-white/10">
          {[
            { id: "dashboard", label: "Dashboard", icon: "grid_view" },
            { id: "orders", label: "Pedidos", icon: "receipt_long" },
            { id: "products", label: "Productos", icon: "inventory_2" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                view === tab.id 
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30" 
                : "text-slate-400 hover:bg-white/5 border border-white/5"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          
          <button 
            onClick={handleLogout}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-red-400 text-xs font-bold hover:bg-red-500/10 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Salir
          </button>
        </nav>

        {view === "dashboard" ? (
          <AdminDashboard adminCode={adminCode} />
        ) : view === "orders" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {orderStats.map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                  <span className={`material-symbols-outlined bg-linear-to-br ${stat.color} bg-clip-text text-transparent text-2xl mb-1`}>
                    {stat.icon}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Filtros Scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {Object.keys(statusLabels).concat("all").reverse().map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                    filter === f 
                    ? "bg-white text-slate-900 border-white" 
                    : "bg-transparent border-white/20 text-slate-400"
                  }`}
                >
                  {f === "all" ? "Todos" : statusLabels[f]}
                </button>
              ))}
            </div>

            {/* Lista de Pedidos */}
            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent"></div></div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-slate-500 font-bold">No se encontraron pedidos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="bg-slate-900/50 border border-white/10 rounded-3xl p-4 sm:p-6 hover:border-cyan-500/30 transition-colors shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                          <span className="material-symbols-outlined">shopping_bag</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">ID Pedido</p>
                          <p className="text-xs font-mono text-slate-300">#{order._id.slice(-8)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="bg-slate-800 border-none text-xs rounded-lg px-2 py-1 focus:ring-1 ring-cyan-500 outline-none"
                        >
                          {Object.entries(statusLabels).map(([val, lab]) => (
                            <option key={val} value={val}>{lab}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">person</span> Datos de Entrega
                        </h4>
                        <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                          <p className="text-sm font-bold text-white">{order.buyer?.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {order.buyer?.address}, {order.buyer?.city}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <a 
                              href={`https://wa.me/57${order.buyer?.phone?.replace(/\s/g, "")}`}
                              target="_blank" 
                              className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-green-500 hover:text-white transition-all"
                            >
                              <span className="material-symbols-outlined text-xs">chat</span> WHATSAPP
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">inventory</span> Resumen de Compra
                        </h4>
                        <div className="bg-white/5 rounded-2xl p-4">
                          <div className="max-h-32 overflow-y-auto pr-2 space-y-2 mb-3 no-scrollbar">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-slate-400"><b className="text-white">{item.quantity}x</b> {item.title}</span>
                                <span className="font-bold">${(item.unit_price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-white/10 pt-3 flex justify-between items-end">
                            <span className="text-[10px] font-bold text-slate-500">TOTAL PAGADO</span>
                            <span className="text-xl font-black text-white bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                              ${order.total?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <ProductAdmin adminCode={adminCode} />
          </div>
        )}
      </main>

      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjKM0/LRgzgKGGS46+mjUhENUKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0" />
    </div>
  );
}