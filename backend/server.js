// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import Product from "./src/models/Product.js";
import Order from "./src/models/Order.js";
import { connectDB } from "./src/db.js";

import { MercadoPagoConfig, Preference, MerchantOrder, Payment } from "mercadopago";

dotenv.config();

const app = express();
app.use(express.json());

// --- Logs de entorno útiles ---
console.log("Backend env loaded");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("BACKEND_PUBLIC_URL:", process.env.BACKEND_PUBLIC_URL || "(not set)");
console.log("MP token:", (process.env.MP_ACCESS_TOKEN || "").slice(0, 5));

// --- DB ---
(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log("MongoDB conectado");
  } catch (err) {
    console.error("Error conectando MongoDB:", err);
    process.exit(1);
  }
})();

// --- CORS ---
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  })
);

// --- MP SDK v2 ---
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// --- Healthcheck ---
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});

// --- Productos ---
app.get("/api/products", async (_req, res) => {
  const items = await Product.find().sort({ createdAt: -1 });
  res.json(items);
});

// --- Helpers ---
async function decreaseStock(order) {
  for (const item of order.items) {
    if (!item?.productId) continue;
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: -Number(item.quantity || 1) } }
    );
  }
}

async function processMerchantOrder(moData) {
  const externalReference = moData?.external_reference;
  if (!externalReference) return;

  const paid = Array.isArray(moData?.payments)
    ? moData.payments.some((p) => p.status === "approved")
    : false;

  const order = await Order.findById(externalReference);
  if (!order) return;

  if (paid && order.status !== "paid") {
    const approved = moData.payments.find((p) => p.status === "approved");
    order.status = "paid";
    order.mp_payment_id = approved?.id?.toString() || order.mp_payment_id;
    await order.save();
    await decreaseStock(order);
    console.log(`Orden ${order._id} marcada como PAID y stock actualizado`);
  } else {
    console.log(`Orden ${order._id} aún no pagada (status: ${order.status})`);
  }
}

// --- Crear preferencia ---
app.post("/api/payments/preference", async (req, res) => {
  try {
    const { items, buyer } = req.body;

    const total = items.reduce(
      (acc, i) => acc + Number(i.unit_price) * Number(i.quantity || 1),
      0
    );

    const order = await Order.create({
      items,
      buyer,
      total,
      status: "pending",
    });

    const FRONTEND_BASE_RAW =
      process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";
    const FRONTEND_BASE = String(FRONTEND_BASE_RAW).trim().replace(/\/$/, "");

    const backendBaseRaw =
      process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
    const backendBase = String(backendBaseRaw).trim().replace(/\/$/, "");

    const preferenceBody = {
      items: items.map((i) => ({
        title: i.title,
        quantity: Number(i.quantity || 1),
        currency_id: "COP",
        unit_price: Number(i.unit_price),
      })),
      back_urls: {
        success: `${FRONTEND_BASE}/success?order=${order._id}`,
        failure: `${FRONTEND_BASE}/failure?order=${order._id}`,
        pending: `${FRONTEND_BASE}/pending?order=${order._id}`,
      },
      auto_return: "approved",
      external_reference: String(order._id),
      notification_url: `${backendBase}/api/payments/webhook`,
    };

    try {
      console.log("MP preference body:", JSON.stringify(preferenceBody));
    } catch {}

    const preferenceClient = new Preference(client);
    let result;
    try {
      result = await preferenceClient.create({ body: preferenceBody });
    } catch (err) {
      const msg = err?.message || "";
      const code = err?.error || "";
      const looksLikeAutoReturn =
        code === "invalid_auto_return" ||
        /auto_return invalid|back_url\.success must be defined/i.test(msg);
      if (looksLikeAutoReturn) {
        const { auto_return, ...withoutAutoReturn } = preferenceBody;
        console.warn("MP create retry without auto_return due to:", msg || code);
        result = await preferenceClient.create({ body: withoutAutoReturn });
      } else {
        throw err;
      }
    }

    const prefId = result?.id || result?.body?.id;
    const initPoint = result?.init_point || result?.body?.init_point;

    order.mp_preference_id = prefId;
    await order.save();

    res.json({ init_point: initPoint, id: prefId, orderId: order._id });
  } catch (e) {
    console.error("Mercado Pago error:", e);
    res.status(e?.status || 500).json({
      error: "Error creando preferencia de pago",
      details: e?.message || e?.error || e,
    });
  }
});

// --- Log de webhook ---
app.use((req, _res, next) => {
  if (req.path.startsWith("/api/payments/webhook")) {
    console.log("🔔 Webhook hit:", req.method, req.originalUrl);
  }
  next();
});

// --- Webhook (acepta GET y POST) ---
app.all("/api/payments/webhook", async (req, res) => {
  try {
    const { type, topic, id, "data.id": dataId } = req.query;
    const notifType = type || topic;     // 'payment' o 'merchant_order'
    const notifId = dataId || id;        // id de payment u order

    console.log("Webhook params:", req.query);

    if (notifType === "payment" && notifId) {
      const paymentClient = new Payment(client);
      const p = await paymentClient.get({ id: notifId });
      const orderId = p?.body?.order?.id; // id de merchant_order
      if (orderId) {
        const merchantOrderClient = new MerchantOrder(client);
        const mo = await merchantOrderClient.get({ merchantOrderId: orderId });
        await processMerchantOrder(mo?.body || mo);
      }
    }

    if (notifType === "merchant_order" && notifId) {
      const merchantOrderClient = new MerchantOrder(client);
      const mo = await merchantOrderClient.get({ merchantOrderId: notifId });
      await processMerchantOrder(mo?.body || mo);
    }

    res.sendStatus(200); // siempre 200 para que MP lo cuente como entregado
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(200);
  }
});

// --- Consultar orden ---
app.get("/api/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

// --- Listar todas las órdenes (para admin) --- 
app.get("/api/orders", async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "items.productId",
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
});

// --- Consultar producto por ID ---
app.get("/api/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

// --- Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend en http://localhost:${PORT}`);
});
