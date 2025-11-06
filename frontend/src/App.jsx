import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    })();
  }, []);

  const addToCart = (p) => {
    setCart((prev) => {
      const found = prev.find((x) => x._id === p._id);
      if (found) {
        return prev.map((x) =>
          x._id === p._id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const checkout = async () => {
    if (!cart.length) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((i) => ({
          title: i.title,
          unit_price: i.price,
          quantity: i.quantity,
          productId: i._id,
        })),
        buyer: { name: "Cliente Demo", email: "cliente@demo.com" },
      }),
    });
    const data = await res.json();
    if (data?.init_point) window.location.href = data.init_point;
    else alert("No se pudo iniciar el pago");
  };

  return (
  <div className="min-h-screen bg-background-light">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Etronix</h1>
          <div className="flex items-center gap-4">
            Carrito: <b>{cart.reduce((a, i) => a + i.quantity, 0)}</b> — <b>${total.toLocaleString("es-CO")}</b>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p._id} className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">{p.title}</h3>
            <p className="mb-4">${p.price.toLocaleString("es-CO")}</p>
            <button
              onClick={() => addToCart(p)}
              className="w-full rounded-lg bg-black text-white py-2"
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </main>

      <footer className="sticky bottom-0 bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>Total: <b>${total.toLocaleString("es-CO")}</b></div>
          <button
            disabled={!cart.length}
            onClick={checkout}
            className="rounded-lg bg-indigo-600 text-white py-2 px-4 disabled:opacity-50"
          >
            Pagar con Mercado Pago
          </button>
        </div>
      </footer>
    </div>
  );
}
