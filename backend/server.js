// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import Product from "./src/models/Product.js";
import Order from "./src/models/Order.js";
import ProcessedEvent from "./src/models/ProcessedEvent.js";
import { connectDB } from "./src/db.js";
import logger from "./src/config/logger.js";
import { requireAdmin } from "./src/middleware/auth.js";
import { mongoSanitizeMiddleware } from "./src/middleware/sanitize.js";
import { 
  validate, 
  createOrderSchema, 
  updateOrderStatusSchema 
} from "./src/validators/orderValidators.js";

import { MercadoPagoConfig, Preference, MerchantOrder, Payment } from "mercadopago";

dotenv.config();

const app = express();

// --- Seguridad ---
// Helmet para headers de seguridad
app.use(helmet());

// Sanitización de datos MongoDB (middleware personalizado para Express 5)
app.use(mongoSanitizeMiddleware);

// Rate limiting general
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
  message: "Demasiadas peticiones desde esta IP, por favor intenta más tarde",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Rate limiting específico para endpoints de pago
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 peticiones por minuto
  message: "Demasiadas solicitudes de pago, espera un momento",
});

app.use(express.json());

// --- Logs de entorno útiles ---
logger.info("Backend iniciando...");
logger.info(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
logger.info(`BACKEND_PUBLIC_URL: ${process.env.BACKEND_PUBLIC_URL || "(not set)"}`);
logger.info(`MP token presente: ${!!(process.env.MP_ACCESS_TOKEN)}`);

// --- DB ---
(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    logger.info("MongoDB conectado exitosamente");
  } catch (err) {
    logger.error("Error conectando MongoDB:", err);
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

async function processMerchantOrder(moData, notificationId = null) {
  const externalReference = moData?.external_reference;
  if (!externalReference) {
    logger.warn("Merchant order sin external_reference");
    return;
  }

  // Verificar si ya procesamos este evento
  if (notificationId) {
    const alreadyProcessed = await ProcessedEvent.findOne({ 
      notificationId: String(notificationId) 
    });
    
    if (alreadyProcessed) {
      logger.info(`Evento ${notificationId} ya fue procesado, omitiendo`);
      return;
    }
  }

  const paid = Array.isArray(moData?.payments)
    ? moData.payments.some((p) => p.status === "approved")
    : false;

  const order = await Order.findById(externalReference);
  if (!order) {
    logger.warn(`Orden ${externalReference} no encontrada`);
    return;
  }

  // Validar que el monto pagado coincida con el total de la orden
  if (paid) {
    const totalPaid = moData.paid_amount || 0;
    const orderTotal = order.total || 0;
    
    if (totalPaid < orderTotal) {
      logger.warn(
        `Pago parcial detectado. Pagado: ${totalPaid}, Esperado: ${orderTotal}. Orden: ${order._id}`
      );
      // Opcional: manejar pagos parciales
      return;
    }
  }

  if (paid && order.status !== "paid") {
    const approved = moData.payments.find((p) => p.status === "approved");
    order.status = "paid";
    order.mp_payment_id = approved?.id?.toString() || order.mp_payment_id;
    await order.save();
    await decreaseStock(order);
    
    logger.info(`Orden ${order._id} marcada como PAID y stock actualizado`);
    
    // Registrar evento como procesado
    if (notificationId) {
      await ProcessedEvent.create({
        notificationId: String(notificationId),
        notificationType: "merchant_order",
        orderId: String(order._id),
        status: "paid",
      });
    }
  } else {
    logger.info(`Orden ${order._id} - Status actual: ${order.status}`);
  }
}

// --- Crear preferencia ---
app.post("/api/payments/preference", paymentLimiter, validate(createOrderSchema), async (req, res) => {
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

    logger.info(`Creando preferencia MP para orden ${order._id}`);

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
        logger.warn("MP create retry sin auto_return debido a:", msg || code);
        result = await preferenceClient.create({ body: withoutAutoReturn });
      } else {
        throw err;
      }
    }

    const prefId = result?.id || result?.body?.id;
    const initPoint = result?.init_point || result?.body?.init_point;

    order.mp_preference_id = prefId;
    await order.save();

    logger.info(`Preferencia MP creada: ${prefId} para orden ${order._id}`);

    res.json({ init_point: initPoint, id: prefId, orderId: order._id });
  } catch (e) {
    logger.error("Error creando preferencia MP:", e);
    res.status(e?.status || 500).json({
      error: "Error creando preferencia de pago",
      details: e?.message || e?.error || e,
    });
  }
});

// --- Procesar pago directo (Checkout Bricks) ---
app.post("/api/payments/process", paymentLimiter, async (req, res) => {
  try {
    const { token, items, buyer, transaction_amount, description, payment_method_id, issuer_id, payer, installments } = req.body;

    logger.info("Datos recibidos en /api/payments/process:", {
      has_token: !!token,
      has_items: !!items,
      has_buyer: !!buyer,
      payment_method_id,
      issuer_id,
      transaction_amount,
      payer_email: payer?.email
    });

    if (!items || !buyer) {
      return res.status(400).json({ error: "items y buyer son requeridos" });
    }

    if (!payment_method_id) {
      logger.error("payment_method_id es null o undefined");
      return res.status(400).json({ 
        error: "payment_method_id es requerido. Asegúrate de completar todos los datos del formulario." 
      });
    }

    // Calcular el total esperado
    const expectedTotal = items.reduce(
      (acc, i) => acc + Number(i.unit_price || i.price) * Number(i.quantity || 1),
      0
    );

    // Validar que el monto coincida
    if (Math.abs(transaction_amount - expectedTotal) > 0.01) {
      return res.status(400).json({ 
        error: "El monto no coincide con el total de los productos" 
      });
    }

    const paymentClient = new Payment(client);
    
    const paymentData = {
      transaction_amount: Number(transaction_amount),
      description: description || `Compra en Etronix Store`,
      payment_method_id: payment_method_id,
      installments: Number(installments) || 1,
      payer: {
        email: payer?.email || buyer.email || "test@test.com"
      }
    };

    // Agregar nombre si existe
    if (payer?.first_name) {
      paymentData.payer.first_name = payer.first_name;
    }
    if (payer?.last_name) {
      paymentData.payer.last_name = payer.last_name;
    }

    // Agregar token si existe (para tarjetas)
    if (token) {
      paymentData.token = token;
    }

    // Agregar issuer_id si existe
    if (issuer_id) {
      paymentData.issuer_id = issuer_id;
    }

    // Agregar identificación si existe
    if (payer?.identification) {
      paymentData.payer.identification = payer.identification;
    }

    logger.info(`Procesando pago con MercadoPago`, { 
      amount: transaction_amount, 
      email: payer?.email || buyer.email,
      payment_method: payment_method_id,
      has_token: !!token,
      issuer_id
    });

    const payment = await paymentClient.create({ body: paymentData });
    const paymentBody = payment?.body || payment;

    logger.info(`Pago creado: ${paymentBody.id}, status: ${paymentBody.status}, detail: ${paymentBody.status_detail}`);

    if (paymentBody.status === "approved") {
      // CREAR LA ORDEN SOLO SI EL PAGO FUE APROBADO
      const order = await Order.create({
        items: items.map(item => ({
          productId: item.productId || item._id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price || item.price
        })),
        buyer,
        total: expectedTotal,
        status: "paid",
        mp_payment_id: String(paymentBody.id)
      });

      await decreaseStock(order);
      
      logger.info(`Orden ${order._id} creada con status PAID`);
      
      return res.json({
        success: true,
        status: "approved",
        orderId: order._id,
        paymentId: paymentBody.id
      });
    } else if (paymentBody.status === "rejected") {
      logger.warn(`Pago rechazado: ${paymentBody.status_detail}`);
      
      return res.json({
        success: false,
        status: "rejected",
        message: paymentBody.status_detail || "Pago rechazado"
      });
    } else {
      // pending, in_process, etc.
      logger.info(`Pago en proceso: ${paymentBody.status}`);
      
      return res.json({
        success: false,
        status: paymentBody.status,
        message: "Pago en proceso"
      });
    }
    
  } catch (e) {
    logger.error("Error procesando pago:", e);
    res.status(e?.status || 500).json({
      error: "Error procesando el pago",
      details: e?.message || e?.error || e,
      cause: e?.cause
    });
  }
});

// --- Log de webhook ---
app.use((req, _res, next) => {
  if (req.path.startsWith("/api/payments/webhook")) {
    logger.info(`🔔 Webhook recibido: ${req.method} ${req.originalUrl}`);
  }
  next();
});

// --- Webhook (acepta GET y POST) ---
app.all("/api/payments/webhook", async (req, res) => {
  try {
    const { type, topic, id, "data.id": dataId } = req.query;
    const notifType = type || topic;     // 'payment' o 'merchant_order'
    const notifId = dataId || id;        // id de payment u order

    logger.info("Webhook params:", req.query);

    if (!notifId) {
      logger.warn("Webhook sin notifId, ignorando");
      return res.sendStatus(200);
    }

    if (notifType === "payment" && notifId) {
      const paymentClient = new Payment(client);
      const p = await paymentClient.get({ id: notifId });
      const orderId = p?.body?.order?.id; // id de merchant_order
      
      logger.info(`Payment ${notifId} obtenido, merchant_order: ${orderId}`);
      
      if (orderId) {
        const merchantOrderClient = new MerchantOrder(client);
        const mo = await merchantOrderClient.get({ merchantOrderId: orderId });
        await processMerchantOrder(mo?.body || mo, notifId);
      }
      
      // Registrar evento procesado
      await ProcessedEvent.findOneAndUpdate(
        { notificationId: String(notifId) },
        {
          notificationId: String(notifId),
          notificationType: "payment",
          status: p?.body?.status || "unknown",
          processedAt: new Date(),
        },
        { upsert: true }
      );
    }

    if (notifType === "merchant_order" && notifId) {
      const merchantOrderClient = new MerchantOrder(client);
      const mo = await merchantOrderClient.get({ merchantOrderId: notifId });
      await processMerchantOrder(mo?.body || mo, notifId);
    }

    res.sendStatus(200); // siempre 200 para que MP lo cuente como entregado
  } catch (err) {
    logger.error("Error en webhook:", err);
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
app.get("/api/orders", requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search 
    } = req.query;
    
    const query = {};
    
    // Filtro por status
    if (status && ["pending", "paid", "failed", "processing", "shipped", "delivered"].includes(status)) {
      query.status = status;
    }
    
    // Búsqueda simple por email o nombre
    if (search) {
      query.$or = [
        { "buyer.email": { $regex: search, $options: "i" } },
        { "buyer.name": { $regex: search, $options: "i" } },
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate({
          path: "items.productId",
          options: { strictPopulate: false }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query)
    ]);
    
    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      }
    });
  } catch (err) {
    logger.error("Error obteniendo órdenes:", err);
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
});

// --- Consultar producto por ID ---
app.get("/api/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

// --- Actualizar estado de orden ---
app.patch("/api/orders/:id", requireAdmin, validate(updateOrderStatusSchema), async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    
    logger.info(`Orden ${order._id} actualizada a status: ${status}`);
    
    res.json(order);
  } catch (err) {
    logger.error("Error actualizando orden:", err);
    res.status(500).json({ error: "Error actualizando la orden" });
  }
});

// --- Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Backend corriendo en http://localhost:${PORT}`);
});
