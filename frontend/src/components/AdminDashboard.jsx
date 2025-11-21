import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboard({ adminCode }) {
  const [stats, setStats] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]); // 👈 nuevo

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminCode) return;

    const fetchStats = async () => {
      try {
        const [generalRes, chartRes, stockRes, categoryRes, topRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/stats/general`, {
            headers: { 'x-admin-code': adminCode }
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/stats/sales-chart`, {
            headers: { 'x-admin-code': adminCode }
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/stats/low-stock`, {
            headers: { 'x-admin-code': adminCode }
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/stats/by-category`, {
            headers: { 'x-admin-code': adminCode }
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/stats/top-products`, {
            headers: { 'x-admin-code': adminCode }
          })
        ]);

        if (generalRes.ok) setStats(await generalRes.json());
        if (chartRes.ok) setSalesChart(await chartRes.json());
        if (stockRes.ok) setLowStock(await stockRes.json());

        if (categoryRes.ok) {
          const raw = await categoryRes.json();
          console.log("RAW CATEGORY DATA:", raw);

          const cleaned = raw
            .filter(cat => cat._id !== null && cat._id !== undefined)
            .map(cat => ({
              name: String(cat._id),
              revenue: Number(cat.revenue)
            }));

          setCategoryStats(cleaned);
        }

        if (topRes.ok) {
          const top = await topRes.json();
          setTopProducts(top);          // 👈 guardar top 5
        }


      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [adminCode]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-8">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ingresos Totales"
          value={`$${stats?.overview.totalRevenue?.toLocaleString('es-CO') || 0}`}
          icon="payments"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Órdenes Totales"
          value={stats?.overview.totalOrders || 0}
          icon="shopping_cart"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Ingresos Este Mes"
          value={`$${stats?.overview.monthRevenue?.toLocaleString('es-CO') || 0}`}
          icon="trending_up"
          color="from-purple-500 to-pink-500"
          subtitle={`${stats?.overview.revenueGrowth > 0 ? '+' : ''}${stats?.overview.revenueGrowth}% vs mes anterior`}
        />
        <StatCard
          title="Órdenes Pendientes"
          value={stats?.overview.pendingOrders || 0}
          icon="pending"
          color="from-amber-500 to-orange-500"
          alert={stats?.overview.pendingOrders > 5}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por día */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">show_chart</span>
            Ventas Últimos 30 Días
          </h3>
          {salesChart.length === 0 ? (
            <p className="text-gray-400 text-center py-10">
              No hay datos de ventas disponibles.
            </p>
          ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={salesChart}
                  margin={{ top: 20, right: 20, left: 10, bottom: 40 }} // 👈 más espacio
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />

                  {/* EJE X – 17/02, menos ticks y más margen */}
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff80"
                    tickFormatter={(value) => {
                      const d = new Date(value);
                      return d.toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "2-digit",
                      });
                    }}
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"   // 👈 no pinta todas las fechas
                    minTickGap={25}              // 👈 obliga más espacio
                    tickMargin={12}              // 👈 separa las fechas del borde
                  />

                  {/* EJE Y – más ancho para que no se corten los números */}
                  <YAxis
                    stroke="#ffffff80"
                    width={80}                     // 👈 reserva espacio
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => v.toLocaleString("es-CO")}
                  />

                  {/* TOOLTIP bonito con fecha completa e ingresos formateados */}
                  <Tooltip
                    labelFormatter={(value) => {
                      const d = new Date(value);
                      return d.toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      });
                    }}
                    formatter={(value, name) => {
                      if (name === "Ingresos") {
                        return [`$${Number(value).toLocaleString("es-CO")}`, "Ingresos"];
                      }
                      return [value, "Órdenes"];
                    }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />

                  {/* LEYENDA abajo, separada de la línea */}
                  <Legend
                    verticalAlign="bottom"
                    height={24}
                    wrapperStyle={{ paddingTop: 16 }}
                  />

                  {/* Líneas limpias: sin punticos constantes, solo al hover */}
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    name="Ingresos"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Órdenes"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
          )}
        </div>

        {/* Ventas por categoría */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">pie_chart</span>
            Ventas por Categoría
          </h3>
          {categoryStats.length === 0 ? (
            <p className="text-gray-400 text-center py-10">
              No hay datos de categorías disponibles.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  nameKey="name"
                  outerRadius={80}
                  dataKey="revenue"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top productos y stock bajo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Productos */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">emoji_events</span>
            Top 5 Productos
          </h3>
          <div className="space-y-3">
            {topProducts.length ? (
              topProducts.map((product, idx) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-black">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-white">{product.title}</p>
                      <p className="text-sm text-gray-400">
                        {product.totalSold} vendidos
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-cyan-400">
                    ${product.revenue?.toLocaleString('es-CO')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-6">
                No hay productos con ventas registradas todavía.
              </p>
            )}
          </div>

        </div>

        {/* Productos con stock bajo */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">warning</span>
            Productos con Stock Bajo
          </h3>
          {lowStock.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              ✅ Todos los productos tienen stock suficiente
            </p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-amber-500/30"
                >
                  <div>
                    <p className="font-bold text-white">{product.title}</p>
                    <p className="text-sm text-gray-400">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-amber-400">
                      {product.stock} unidades
                    </span>
                    <span className="text-xs text-gray-400">
                      ${product.price?.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente StatCard
function StatCard({ title, value, icon, color, subtitle, alert }) {
  return (
    <div
      className={`backdrop-blur-xl bg-white/10 rounded-2xl border ${alert ? 'border-amber-500/50' : 'border-white/20'
        } p-6 shadow-xl hover:shadow-2xl transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400 font-semibold mb-1">{title}</p>
          <p className="text-3xl font-black text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`bg-linear-to-br ${color} p-3 rounded-xl`}>
          <span className="material-symbols-outlined text-2xl text-white">
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}
