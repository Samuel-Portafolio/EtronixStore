// server.js
import express from "express";
import mongoose from "mongoose";
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
import { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler,
  AppError,
  NotFoundError,
  InsufficientStockError 
} from "./src/middleware/errorHandler.js";

import { MercadoPagoConfig, Preference, MerchantOrder, Payment } from "mercadopago";
import compression from 'compression';

dotenv.config();

const app = express();

// --- Seguridad ---
// Helmet para headers de seguridad
app.use(helmet());

// Sanitización de datos MongoDB (middleware personalizado para Express 5)
app.use(mongoSanitizeMiddleware);

// 1. COMPRESIÓN GZIP/BROTLI
app.use(compression({
  level: 6, // Balance entre velocidad y compresión
  threshold: 1024, // Solo comprimir respuestas > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// 2. CACHE HEADERS PARA ASSETS ESTÁTICOS
app.use((req, res, next) => {
  // Cache para assets inmutables (1 año)
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // No cache para API
  else if (req.url.startsWith('/api/')) {
    res.set('Cache-Control', 'no-store, must-revalidate');
  }
  next();
});

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
  const health = {
    ok: true,
    service: "backend",
    time: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
  };
  
  const status = health.mongodb === 'connected' ? 200 : 503;
  res.status(status).json(health);
});


// --- Función para validar stock ---
async function validateStock(items) {
  const stockErrors = [];
  
  for (const item of items) {
    const productId = item.productId || item._id;
    const requestedQty = Number(item.quantity || 1);
    
    if (!productId) {
      stockErrors.push({ error: "ProductId faltante en uno de los items" });
      continue;
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      stockErrors.push({ 
        productId, 
        error: `Producto no encontrado` 
      });
      continue;
    }
    
    const availableStock = Number(product.stock || 0);
    
    if (availableStock < requestedQty) {
      stockErrors.push({
        productId,
        productName: product.name,
        available: availableStock,
        requested: requestedQty,
        error: `Stock insuficiente para ${product.name}. Disponible: ${availableStock}, Solicitado: ${requestedQty}`
      });
    }
  }
  
  return stockErrors;
}

// --- Normalizar items con datos del servidor (precio y título) ---
async function normalizeItemsFromDB(items) {
  const ids = items
    .map((i) => i.productId || i._id)
    .filter(Boolean)
    .map(String);

  if (!ids.length) {
    throw new AppError("Items inválidos: faltan productId", 400);
  }

  const products = await Product.find({ _id: { $in: ids } }).lean();
  const map = new Map(products.map((p) => [String(p._id), p]));

  const normalized = items.map((i) => {
    const key = String(i.productId || i._id);
    const prod = map.get(key);
    if (!prod) {
      throw new NotFoundError("Producto");
    }
    return {
      productId: prod._id,
      title: prod.title,
      quantity: Number(i.quantity || 1),
      unit_price: Number(prod.price),
    };
  });

  const total = normalized.reduce(
    (acc, it) => acc + Number(it.unit_price) * Number(it.quantity),
    0
  );

  return { items: normalized, total };
}

// --- Productos ---
app.get("/api/products", asyncHandler(async (req, res) => {
  // Cache en memoria simple (en producción usar Redis)
  const cacheKey = 'all_products';
  const cached = productCache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  // Proyección: solo campos necesarios
  const items = await Product.find(
    { stock: { $gte: 0 } }, // Solo productos con stock >= 0
    {
      title: 1,
      price: 1,
      image: 1,
      stock: 1,
      category: 1,
      description: 1,
      specs: 1,
      // Excluir campos pesados si no se necesitan
    }
  )
  .sort({ createdAt: -1 })
  .lean(); // .lean() mejora performance significativamente
  
  // Guardar en cache por 5 minutos
  productCache.set(cacheKey, items, 300);
  
  res.json(items);
}));

// 7. CACHE EN MEMORIA SIMPLE (top del archivo)
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  
  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000)
    });
  }
  
  clear() {
    this.cache.clear();
  }
}

const productCache = new SimpleCache();
productCache.clear();


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

// --- Disminuir stock de forma atómica y segura ---
async function decreaseStockAtomic(order, session) {
  const updated = [];
  try {
    for (const item of order.items) {
      const qty = Number(item.quantity || 1);
      if (!item?.productId || qty <= 0) continue;

      const res = await Product.updateOne(
        { _id: item.productId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { session }
      );

      if (res.modifiedCount !== 1) {
        throw new InsufficientStockError(`Producto ${item.productId}`, "?", qty);
      }
      updated.push({ id: item.productId, qty });
    }
  } catch (err) {
    // Si no hay sesión (sin transacción), intentamos revertir manualmente
    if (!session) {
      for (const u of updated) {
        await Product.updateOne(
          { _id: u.id },
          { $inc: { stock: u.qty } }
        );
      }
    }
    throw err;
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
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const approved = moData.payments.find((p) => p.status === "approved");
        const fresh = await Order.findById(order._id).session(session);
        if (!fresh) return;
        if (fresh.status === "paid") return; // idempotencia

        fresh.status = "paid";
        fresh.mp_payment_id = approved?.id?.toString() || fresh.mp_payment_id;
        await fresh.save({ session });

        await decreaseStockAtomic(fresh, session);

        // Registrar evento como procesado dentro de la transacción
        if (notificationId) {
          await ProcessedEvent.create([
            {
              notificationId: String(notificationId),
              notificationType: "merchant_order",
              orderId: String(fresh._id),
              status: "paid",
            },
          ], { session });
        }
      });
      logger.info(`Orden ${order._id} marcada como PAID y stock actualizado (atómico)`);
    } finally {
      session.endSession();
    }
  } else {
    logger.info(`Orden ${order._id} - Status actual: ${order.status}`);
  }
}

// --- Crear preferencia ---
app.post("/api/payments/preference", paymentLimiter, validate(createOrderSchema), asyncHandler(async (req, res) => {
  const { items, buyer } = req.body;

  // Validar stock antes de crear la orden
  const stockErrors = await validateStock(items);
  if (stockErrors.length > 0) {
    throw new AppError(
      `Problemas con el stock: ${stockErrors.map(e => e.error).join(", ")}`,
      400
    );
  }

  // Recalcular precios y totales desde la BD (no confiamos en el cliente)
  const { items: normalizedItems, total } = await normalizeItemsFromDB(items);

  const order = await Order.create({
    items: normalizedItems,
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
    items: normalizedItems.map((i) => ({
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
}));

// --- Procesar pago directo (Checkout Bricks) ---
app.post("/api/payments/process", paymentLimiter, asyncHandler(async (req, res) => {
  const { token, items, buyer, description, payment_method_id, issuer_id, payer, installments } = req.body;

  logger.info("Datos recibidos en /api/payments/process:", {
    has_token: !!token,
    has_items: !!items,
    has_buyer: !!buyer,
    payment_method_id,
    issuer_id,
    client_amount: req.body?.transaction_amount,
    payer_email: payer?.email
  });

  if (!items || !buyer) {
    throw new AppError("items y buyer son requeridos", 400);
  }

  if (!payment_method_id) {
    logger.error("payment_method_id es null o undefined");
    throw new AppError(
      "payment_method_id es requerido. Asegúrate de completar todos los datos del formulario.",
      400
    );
  }

  // Validar stock antes de procesar el pago
  const stockErrors = await validateStock(items);
  if (stockErrors.length > 0) {
    throw new AppError(
      `Problemas con el stock: ${stockErrors.map(e => e.error).join(", ")}`,
      400
    );
  }

  // Recalcular total e items desde la BD para garantizar integridad
  const { items: normalizedItems, total: expectedTotal } = await normalizeItemsFromDB(items);

  const paymentClient = new Payment(client);
  
  const paymentData = {
    transaction_amount: Number(expectedTotal),
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
    amount: expectedTotal, 
    email: payer?.email || buyer.email,
    payment_method: payment_method_id,
    has_token: !!token,
    issuer_id
  });

  const payment = await paymentClient.create({ body: paymentData });
  const paymentBody = payment?.body || payment;

  logger.info(`Pago creado: ${paymentBody.id}, status: ${paymentBody.status}, detail: ${paymentBody.status_detail}`);

  if (paymentBody.status === "approved") {
    // CREAR LA ORDEN SOLO SI EL PAGO FUE APROBADO, usando transacción para stock
    const session = await mongoose.startSession();
    let newOrder;
    try {
      await session.withTransaction(async () => {
        newOrder = new Order({
          items: normalizedItems,
          buyer,
          total: expectedTotal,
          status: "paid",
          mp_payment_id: String(paymentBody.id)
        });
        await newOrder.save({ session });
        await decreaseStockAtomic(newOrder, session);
      });
    } catch (err) {
      logger.error("Error transaccional creando orden pagada:", { message: err.message });
      throw err;
    } finally {
      session.endSession();
    }

    logger.info(`Orden ${newOrder._id} creada con status PAID (stock descontado atómicamente)`);
    
    return res.json({
      success: true,
      status: "approved",
      orderId: newOrder._id,
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
}));

// --- Log de webhook ---
app.use((req, _res, next) => {
  if (req.path.startsWith("/api/payments/webhook")) {
    logger.info(`🔔 Webhook recibido: ${req.method} ${req.originalUrl}`);
  }
  next();
});

// --- Webhook (acepta GET y POST) ---
app.all("/api/payments/webhook", asyncHandler(async (req, res) => {
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
}));

// --- Consultar orden ---
app.get("/api/orders/:id", asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new NotFoundError("Orden");
  }
  res.json(order);
}));

// --- Listar todas las órdenes (para admin) --- 
app.get("/api/orders", requireAdmin, asyncHandler(async (req, res) => {
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
}));

// --- Consultar producto por ID ---
app.get("/api/products/:id", asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new NotFoundError("Producto");
  }
  res.json(product);
}));

// --- Actualizar estado de orden ---
app.patch("/api/orders/:id", requireAdmin, validate(updateOrderStatusSchema), asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  
  if (!order) {
    throw new NotFoundError("Orden");
  }
  
  logger.info(`Orden ${order._id} actualizada a status: ${status}`);
  
  res.json(order);
}));

// --- Middleware de manejo de errores ---
// Debe ir después de todas las rutas
app.use(notFoundHandler);
app.use(errorHandler);

// --- Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Backend corriendo en http://localhost:${PORT}`);
});
