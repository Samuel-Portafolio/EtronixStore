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
  const [view, setView] = useState("dashboard"); // "orders" | "products"

  // Ya no hay sesión persistente → siempre pide código

  useEffect(() => {
    // Verificar si hay adminCode y si la sesión no ha expirado
    const code = localStorage.getItem("adminCode") || "";
    const loginTime = parseInt(localStorage.getItem("adminLoginTime"), 10) || 0;
    const now = Date.now();
    const maxSession = 60 * 60 * 1000; // 1 hora en ms
    if (code && loginTime && now - loginTime < maxSession) {
      setAdminCode(code);
      setIsAuthenticated(true);
    } else {
      // Si expiró, limpiar y pedir login
      localStorage.removeItem("adminCode");
      localStorage.removeItem("adminLoginTime");
      setIsAuthenticated(false);
      setAdminCode("");
    }
    setCheckingAuth(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginSuccess = (code) => {
    setAdminCode(code);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try {
      // Por si acaso aún quedan cosas viejas
      localStorage.removeItem("adminCode");
      localStorage.removeItem("adminLoginTime");
    } catch (e) {}
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

      // Notificación de nuevos pedidos
      if (lastOrderCount > 0 && ordersList.length > lastOrderCount) {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification("¡Nuevo pedido!", {
              body: `Tienes ${ordersList.length - lastOrderCount} pedido(s) nuevo(s)`,
              icon: "/favicon.ico",
            });
          } catch (e) {}
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
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, adminCode]);

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    paid: "bg-green-500/20 text-green-300 border-green-500/30",
    failed: "bg-red-500/20 text-red-300 border-red-500/30",
    processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    shipped: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    delivered: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  };

  const statusLabels = {
    pending: "Pendiente",
    paid: "Pagado",
    failed: "Fallido",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!adminCode) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-code": adminCode,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o
          )
        );
      } else if (res.status === 401 || res.status === 403) {
        alert("Sesión expirada. Por favor inicia sesión nuevamente.");
        handleLogout();
      } else {
        alert("Error actualizando el estado");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error actualizando el estado");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  // Estado de “verificando”
  if (checkingAuth) {
    return (
      <>
        <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-br from-gray-900 via-slate-900 to-black">
          <LightRays
            raysOrigin="top-center"
            raysColor="#00d4ff"
            raysSpeed={1.5}
            lightSpread={0.9}
            rayLength={1.2}
            followMouse
            mouseInfluence={0.12}
            noiseAmount={0.06}
            distortion={0.03}
            className="w-full h-full pointer-events-none opacity-70"
          />
        </div>
        <div className="relative min-h-screen flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
        </div>
      </>
    );
  }

  // No autenticado → pantalla de login con fondo negro
  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Acceso Administrador | Etronix Store</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-br from-gray-900 via-slate-900 to-black">
          <LightRays
            raysOrigin="top-center"
            raysColor="#00d4ff"
            raysSpeed={1.5}
            lightSpread={0.9}
            rayLength={1.2}
            followMouse
            mouseInfluence={0.12}
            noiseAmount={0.06}
            distortion={0.03}
            className="w-full h-full pointer-events-none opacity-70"
          />
        </div>

        <div className="relative min-h-screen z-10 flex items-center justify-center">
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        </div>
      </>
    );
  }

  // Vista autenticada
  return (
    <>
      <Helmet>
        <title>Panel de Administración | Etronix Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Fondo negro */}
      <div className="fixed inset-0 w-full h-full z-0 bg-linear-to-br from-gray-900 via-slate-900 to-black">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00d4ff"
          raysSpeed={1.5}
          lightSpread={0.9}
          rayLength={1.2}
          followMouse
          mouseInfluence={0.12}
          noiseAmount={0.06}
          distortion={0.03}
          className="w-full h-full pointer-events-none opacity-60"
        />
      </div>

      <div className="relative min-h-screen z-10">
        <audio
          ref={audioRef}
          src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjKM0/LRgzgKGGS46+mjUhENUKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0"
        />

        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-gray-900/80 border-b border-white/10 shadow-lg">
          <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-cyan-500/30 to-blue-500/30 rounded-lg blur-md" />
                <span className="relative material-symbols-outlined text-3xl text-cyan-400">
                  dashboard
                </span>
              </div>
              <h1 className="text-2xl font-black bg-linear-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setView("dashboard")}
                  className={`px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 ${
                    view === "dashboard"
                      ? "bg-linear-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  Dashboard
                </button>
                
                <button
                  onClick={() => setView("orders")}
                  className={`px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 ${
                    view === "orders"
                      ? "bg-linear-to-r from-green-500 to-teal-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                  Pedidos
                </button>
                
                <button
                  onClick={() => setView("products")}
                  className={`px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 ${
                    view === "products"
                      ? "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">inventory_2</span>
                  Productos
                </button>
              </div>

              <button
                onClick={fetchOrders}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-white font-black shadow-lg hover:shadow-cyan-500/50 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  refresh
                </span>
                Actualizar
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl border-2 border-red-500/50 text-red-400 font-black hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  logout
                </span>
                Cerrar
              </button>

              <Link
                to="/shop"
                className="px-4 py-2 rounded-xl border-2 border-white/30 text-white font-black hover:bg-white/10 hover:border-cyan-400/50 transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                Tienda
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 pb-12">
          {view === "dashboard" ? (
            <div className="mt-8">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2">Dashboard</h2>
                <p className="text-gray-400">Vista general de tu negocio</p>
              </div>
              <AdminDashboard adminCode={adminCode} />
            </div>
          ) : view === "orders" ? (
            <>
              {/* Estadísticas */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8 mt-8">
                {[
                  {
                    label: "Total",
                    value: orderStats.total,
                    color: "from-gray-600 to-gray-700",
                    icon: "summarize",
                  },
                  {
                    label: "Pendientes",
                    value: orderStats.pending,
                    color: "from-yellow-600 to-yellow-700",
                    icon: "pending",
                  },
                  {
                    label: "Pagados",
                    value: orderStats.paid,
                    color: "from-green-600 to-green-700",
                    icon: "paid",
                  },
                  {
                    label: "Procesando",
                    value: orderStats.processing,
                    color: "from-blue-600 to-blue-700",
                    icon: "sync",
                  },
                  {
                    label: "Enviados",
                    value: orderStats.shipped,
                    color: "from-purple-600 to-purple-700",
                    icon: "local_shipping",
                  },
                  {
                    label: "Entregados",
                    value: orderStats.delivered,
                    color: "from-teal-600 to-teal-700",
                    icon: "check_circle",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="backdrop-blur-xl bg-linear-to-br from-white/15 to-white/5 rounded-2xl border border-white/20 p-4 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                  >
                    <span
                      className={`material-symbols-outlined text-3xl mb-2 bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}
                    >
                      {stat.icon}
                    </span>
                    <p className="text-sm font-bold text-gray-300">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-black text-white">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Filtros */}
              <div className="mb-8 flex flex-wrap gap-2 justify-center">
                {[
                  { value: "all", label: "Todos", icon: "list" },
                  { value: "pending", label: "Pendientes", icon: "pending" },
                  { value: "paid", label: "Pagados", icon: "paid" },
                  {
                    value: "processing",
                    label: "Procesando",
                    icon: "sync",
                  },
                  {
                    value: "shipped",
                    label: "Enviados",
                    icon: "local_shipping",
                  },
                  {
                    value: "delivered",
                    label: "Entregados",
                    icon: "check_circle",
                  },
                  { value: "failed", label: "Fallidos", icon: "cancel" },
                ].map((filterOption) => (
                  <button
                    key={filterOption.value}
                    onClick={() => setFilter(filterOption.value)}
                    className={`px-5 py-2.5 rounded-xl font-black transition-all flex items-center gap-2 shadow-lg ${
                      filter === filterOption.value
                        ? "bg-linear-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/50"
                        : "backdrop-blur-md bg-white/10 border-2 border-white/20 text-gray-300 hover:bg-white/20 hover:border-cyan-400/50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {filterOption.icon}
                    </span>
                    {filterOption.label}
                  </button>
                ))}
              </div>

              {/* Lista de pedidos */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="backdrop-blur-xl bg-linear-to-br from-white/15 to-white/5 rounded-2xl border border-white/20 p-8 text-center shadow-xl">
                  <p className="text-gray-300 text-lg font-bold">
                    {filter === "all"
                      ? "No hay pedidos aún"
                      : `No hay pedidos ${filter}`}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredOrders.map((order) => (
                    <div
                      key={order._id}
                      className="backdrop-blur-xl bg-linear-to-br from-white/15 to-white/5 rounded-2xl border border-white/20 p-6 shadow-xl hover:shadow-2xl hover:border-cyan-400/50 transition-all"
                    >
                      {/* Encabezado del pedido */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-2xl text-cyan-400">
                            receipt_long
                          </span>
                          <div>
                            <p className="text-xs text-gray-400 mb-1 font-bold">
                              ID: {order._id}
                            </p>
                            <p className="text-sm text-gray-300">
                              📅{" "}
                              {new Date(order.createdAt).toLocaleString(
                                "es-CO"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end gap-2">
                          <span
                            className={`px-4 py-1.5 rounded-xl text-xs font-black border ${
                              statusColors[order.status]
                            }`}
                          >
                            {statusLabels[order.status]}
                          </span>

                          {order.status !== "failed" && (
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order._id, e.target.value)
                              }
                              className="text-xs px-3 py-1.5 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 text-gray-200 font-bold"
                            >
                              <option value="pending" className="bg-gray-900">
                                Pendiente
                              </option>
                              <option value="paid" className="bg-gray-900">
                                Pagado
                              </option>
                              <option
                                value="processing"
                                className="bg-gray-900"
                              >
                                Procesando
                              </option>
                              <option value="shipped" className="bg-gray-900">
                                Enviado
                              </option>
                              <option
                                value="delivered"
                                className="bg-gray-900"
                              >
                                Entregado
                              </option>
                              <option value="failed" className="bg-gray-900">
                                Fallido
                              </option>
                            </select>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Información del cliente */}
                        <div className="backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/10">
                          <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-cyan-400">
                              person
                            </span>
                            Información del Cliente
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-bold text-gray-300">
                                Nombre:
                              </span>
                              <p className="text-white">
                                {order.buyer?.name || "Sin nombre"}
                              </p>
                            </div>

                            <div>
                              <span className="font-bold text-gray-300">
                                Teléfono:
                              </span>
                              <p className="text-white">
                                {order.buyer?.phone || "Sin teléfono"}
                              </p>
                              {order.buyer?.phone && (
                                <a
                                  href={`https://wa.me/57${order.buyer.phone.replace(
                                    /\s/g,
                                    ""
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-400 hover:text-green-300 font-bold text-xs mt-1 inline-flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-base">
                                    whatsapp
                                  </span>{" "}
                                  WhatsApp
                                </a>
                              )}
                            </div>

                            {order.buyer?.email && (
                              <div>
                                <span className="font-bold text-gray-300">
                                  Email:
                                </span>
                                <p className="text-white break-all">
                                  {order.buyer.email}
                                </p>
                              </div>
                            )}

                            <div>
                              <span className="font-bold text-gray-300">
                                Dirección:
                              </span>
                              <p className="text-white">
                                {order.buyer?.address || "Sin dirección"}
                              </p>
                            </div>

                            <div>
                              <span className="font-bold text-gray-300">
                                Ciudad:
                              </span>
                              <p className="text-white">
                                {order.buyer?.city || "Sin ciudad"}
                              </p>
                            </div>

                            {order.buyer?.notes && (
                              <div>
                                <span className="font-bold text-gray-300">
                                  Notas:
                                </span>
                                <p className="text-gray-300 italic">
                                  "{order.buyer.notes}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Productos */}
                        <div className="backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/10">
                          <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-cyan-400">
                              inventory_2
                            </span>
                            Productos
                          </h3>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-start text-sm backdrop-blur-md bg-white/5 p-3 rounded-lg border border-white/10"
                              >
                                <div className="flex-1">
                                  <p className="font-black text-white">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    $
                                    {item.unit_price?.toLocaleString("es-CO")}{" "}
                                    x {item.quantity}
                                  </p>
                                </div>
                                <span className="font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                  $
                                  {(
                                    item.unit_price * item.quantity
                                  ).toLocaleString("es-CO")}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Total */}
                          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                            <span className="font-black text-white">
                              TOTAL:
                            </span>
                            <span className="text-2xl font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                              $
                              {order.total?.toLocaleString("es-CO")}
                            </span>
                          </div>

                          {order.mp_payment_id && (
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <span className="material-symbols-outlined text-base text-cyan-400">
                                credit_card
                              </span>
                              ID Pago MP: {order.mp_payment_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Vista de gestión de productos
            <div className="mt-8">
              <ProductAdmin adminCode={adminCode} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
