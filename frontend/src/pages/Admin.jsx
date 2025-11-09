import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AdminLogin from "../components/AdminLogin";
import { Helmet } from "react-helmet-async";

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, paid, failed
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const audioRef = useRef(null);
  
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const savedCode = localStorage.getItem('adminCode');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (savedCode && loginTime) {
      // Verificar que la sesión no haya expirado (24 horas)
      const now = Date.now();
      const elapsed = now - parseInt(loginTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (elapsed < twentyFourHours) {
        setAdminCode(savedCode);
        setIsAuthenticated(true);
      } else {
        // Sesión expirada
        handleLogout();
      }
    }
    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = (code) => {
    setAdminCode(code);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminCode');
    localStorage.removeItem('adminLoginTime');
    setIsAuthenticated(false);
    setAdminCode('');
    setOrders([]);
  };

  const fetchOrders = async () => {
    if (!adminCode) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        headers: {
          'x-admin-code': adminCode
        }
      });
      
      if (res.status === 401 || res.status === 403) {
        // Código inválido - hacer logout
        handleLogout();
        return;
      }
      
      const data = await res.json();
      
      // Manejar nueva estructura con paginación
      const ordersList = data.orders || data;
      
      // Detectar nuevos pedidos
      if (lastOrderCount > 0 && ordersList.length > lastOrderCount) {
        // Hay nuevos pedidos, reproducir sonido
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio error:", e));
        }
        // Mostrar notificación del navegador
        if (Notification.permission === "granted") {
          new Notification("¡Nuevo pedido!", {
            body: `Tienes ${ordersList.length - lastOrderCount} pedido(s) nuevo(s)`,
            icon: "/favicon.ico"
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
    
    // Solicitar permiso para notificaciones
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    fetchOrders();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchOrders, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, adminCode]);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    delivered: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-code": adminCode
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Actualizar localmente
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
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

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    paid: orders.filter(o => o.status === "paid").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  // Mostrar pantalla de carga mientras verifica autenticación
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      <Helmet>
        <title>Panel de Administración | Etronix Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        {/* Audio para notificación */}
        <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjKM0/LRgzgKGGS46+mjUhENUKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0yH8yBSh+zPLaizsIHWu96+mjUBELTKXh8LJeHwU7k9n0" />

        {/* Encabezado interno de la página (no global) */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Panel de Administración</h1>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Última actualización: {new Date().toLocaleTimeString("es-CO")}</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={fetchOrders} className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-opacity-90 transition-colors">🔄 Actualizar</button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-red-500 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Cerrar Sesión
              </button>
              <Link to="/shop" className="text-sm text-primary hover:underline">← Volver a la tienda</Link>
            </div>
          </div>
        </div>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 pb-12">
          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-4">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Total</p>
              <p className="text-2xl font-bold text-text-light dark:text-text-dark">{orderStats.total}</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-4">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendientes</p>
              <p className="text-2xl font-bold text-text-light dark:text-text-dark">{orderStats.pending}</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-4">
              <p className="text-sm text-green-600 dark:text-green-400">Pagados</p>
              <p className="text-2xl font-bold text-text-light dark:text-text-dark">{orderStats.paid}</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400">Procesando</p>
              <p className="text-2xl font-bold text-text-light dark:text-text-dark">{orderStats.processing}</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-4">
              <p className="text-sm text-purple-600 dark:text-purple-400">Enviados</p>
              <p className="text-2xl font-bold text-text-light dark:text-text-dark">{orderStats.shipped}</p>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-4">
              <p className="text-sm text-teal-600 dark:text-teal-400">Entregados</p>
              <p className="text-2xl font-bold text-text-light dark:text-text-dark">{orderStats.delivered}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { value: "all", label: "Todos" },
              { value: "pending", label: "Pendientes" },
              { value: "paid", label: "Pagados" },
              { value: "processing", label: "Procesando" },
              { value: "shipped", label: "Enviados" },
              { value: "delivered", label: "Entregados" },
              { value: "failed", label: "Fallidos" },
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === filterOption.value
                    ? "bg-primary text-black"
                    : "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-border-light dark:hover:bg-border-dark"
                  }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          {/* Lista de pedidos */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-8 text-center">
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                {filter === "all" ? "No hay pedidos aún" : `No hay pedidos ${filter}`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Encabezado del pedido */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
                    <div>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-1">
                        ID: {order._id}
                      </p>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        📅 {new Date(order.createdAt).toLocaleString("es-CO")}
                      </p>
                    </div>

                    {/* Estado y cambio de estado */}
                    <div className="flex flex-col gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${statusColors[order.status]
                          }`}
                      >
                        {statusLabels[order.status]}
                      </span>

                      {/* Selector de estado */}
                      {order.status !== "failed" && (
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="text-xs px-2 py-1 rounded border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="paid">Pagado</option>
                          <option value="processing">Procesando</option>
                          <option value="shipped">Enviado</option>
                          <option value="delivered">Entregado</option>
                          <option value="failed">Fallido</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Información del cliente */}
                    <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                      <h3 className="text-sm font-bold text-text-light dark:text-text-dark mb-3 flex items-center gap-2">
                        👤 Información del Cliente
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold text-text-light dark:text-text-dark">Nombre:</span>
                          <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            {order.buyer?.name || "Sin nombre"}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-text-light dark:text-text-dark">Teléfono:</span>
                          <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            {order.buyer?.phone || "Sin teléfono"}
                          </p>
                          {order.buyer?.phone && (
                            <a
                              href={`https://wa.me/57${order.buyer.phone.replace(/\s/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline text-xs mt-1 inline-block"
                            >
                              📱 Contactar por WhatsApp
                            </a>
                          )}
                        </div>

                        {order.buyer?.email && (
                          <div>
                            <span className="font-semibold text-text-light dark:text-text-dark">Email:</span>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark break-all">
                              {order.buyer.email}
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="font-semibold text-text-light dark:text-text-dark">Dirección:</span>
                          <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            {order.buyer?.address || "Sin dirección"}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-text-light dark:text-text-dark">Ciudad:</span>
                          <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            {order.buyer?.city || "Sin ciudad"}
                          </p>
                        </div>

                        {order.buyer?.notes && (
                          <div>
                            <span className="font-semibold text-text-light dark:text-text-dark">Notas:</span>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark italic">
                              "{order.buyer.notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Productos */}
                    <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                      <h3 className="text-sm font-bold text-text-light dark:text-text-dark mb-3 flex items-center gap-2">
                        📦 Productos
                      </h3>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start text-sm bg-card-light dark:bg-card-dark p-3 rounded border border-border-light dark:border-border-dark"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-text-light dark:text-text-dark">
                                {item.title}
                              </p>
                              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                ${item.unit_price?.toLocaleString("es-CO")} x {item.quantity}
                              </p>
                            </div>
                            <span className="font-bold text-primary">
                              ${(item.unit_price * item.quantity).toLocaleString("es-CO")}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark flex justify-between items-center">
                        <span className="font-bold text-text-light dark:text-text-dark">TOTAL:</span>
                        <span className="text-2xl font-bold text-primary">
                          ${order.total?.toLocaleString("es-CO")}
                        </span>
                      </div>

                      {order.mp_payment_id && (
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                          💳 ID Pago MP: {order.mp_payment_id}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
