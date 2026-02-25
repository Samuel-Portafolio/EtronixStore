// server.js
console.log("🚀 Iniciando servidor...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGODB_URI presente:", !!process.env.MONGODB_URI);

import express from "express";
import multer from "multer";
import fs from "fs";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

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
  updateOrderStatusSchema,
} from "./src/validators/orderValidators.js";
import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  NotFoundError,
  InsufficientStockError,
} from "./src/middleware/errorHandler.js";

import {
  MercadoPagoConfig,
  Preference,
  MerchantOrder,
  Payment,
} from "mercadopago";

import statsRouter from "./src/routes/stats.js";

// Solo cargar .env en desarrollo (en producción Render inyecta las variables)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// -------------------------
// CONFIGURACIÓN DE MULTER
// -------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "imageFiles") {
      cb(null, "uploads/images/");
    } else if (file.fieldname === "videoFiles") {
      cb(null, "uploads/videos/");
    } else {
      cb(new Error("Tipo de archivo no soportado"));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (
      file.fieldname === "videoFiles" &&
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else if (
      file.fieldname === "imageFiles" &&
      (file.mimetype.startsWith("image/jpeg") ||
        file.mimetype.startsWith("image/png") ||
        file.mimetype.startsWith("image/webp"))
    ) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos de video o imagen"));
    }
  },
});

// Crear carpetas de uploads si no existen
if (!fs.existsSync("uploads/videos/")) {
  fs.mkdirSync("uploads/videos/", { recursive: true });
}
if (!fs.existsSync("uploads/images/")) {
  fs.mkdirSync("uploads/images/", { recursive: true });
}

// -------------------------
// APP EXPRESS
// -------------------------
const app = express();

// Confiar en el proxy para X-Forwarded-For (Render/Heroku/etc)
app.set("trust proxy", 1);

// Servir archivos estáticos de uploads (imágenes y videos)
app.use("/uploads", express.static("uploads"));

// -------------------------
// SEGURIDAD (Helmet)
// -------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://sdk.mercadopago.com",
          "https://www.mercadopago.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "https://images.unsplash.com"],
        connectSrc: [
          "'self'",
          "https://api.mercadopago.com",
          process.env.FRONTEND_URL,
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Sanitización de datos MongoDB
app.use(mongoSanitizeMiddleware);

// COMPRESIÓN GZIP/BROTLI
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// CACHE HEADERS PARA ASSETS Y APIS
app.use((req, res, next) => {
  const url = req.url;

  // Assets inmutables - 1 año
  if (url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|webp)$/)) {
    res.set({
      "Cache-Control": "public, max-age=31536000, immutable",
      Expires: new Date(Date.now() + 31536000000).toUTCString(),
    });
  }
  // API de productos - cache corto con revalidación
  else if (url.startsWith("/api/products")) {
    res.set({
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      Vary: "Accept-Encoding",
    });
  }
  // Admin / pagos - SIN caché
  else if (
    url.startsWith("/api/orders") ||
    url.startsWith("/api/payments")
  ) {
    res.set({
      "Cache-Control":
        "private, no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
  }
  // Resto de APIs: no-store
  else if (url.startsWith("/api/")) {
    res.set("Cache-Control", "no-store, must-revalidate");
  }

  next();
});

// Rate limiting general
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Demasiadas peticiones desde esta IP, por favor intenta más tarde",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Rate limiting específico para pagos
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Demasiadas solicitudes de pago, espera un momento",
});

// JSON body parser
app.use(express.json());

// Logs de entorno
console.log("📋 Configuración cargada");
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`BACKEND_PUBLIC_URL: ${process.env.BACKEND_PUBLIC_URL || "(not set)"}`);
console.log(`MP token presente: ${!!process.env.MP_ACCESS_TOKEN}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI?.substring(0, 30)}...`);

// Conexión a MongoDB
console.log("🔌 Intentando conectar a MongoDB...");
(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log("✅ MongoDB conectado exitosamente");
  } catch (err) {
    console.error("❌ Error conectando MongoDB:", err.message);
    process.exit(1);
  }
})();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

// MercadoPago SDK v2
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// -------------------------
// HEALTHCHECK
// -------------------------
app.get("/api/health", (_req, res) => {
  const health = {
    ok: true,
    service: "backend",
    time: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    memory: process.memoryUsage(),
  };

  const status = health.mongodb === "connected" ? 200 : 503;
  res.status(status).json(health);
});

// -------------------------
// CACHE EN MEMORIA SIMPLE
// -------------------------
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
      expires: Date.now() + ttlSeconds * 1000,
    });
  }

  clear() {
    this.cache.clear();
  }
}

const productCache = new SimpleCache();

// -------------------------
// HELPERS DE STOCK
// -------------------------
async function validateStock(items) {
  const stockErrors = [];

  for (const item of items) {
    const productId = item.productId || item._id;
    const requestedQty = Number(item.quantity || 1);

    if (!productId) {
      stockErrors.push({
        error: "ProductId faltante en uno de los items",
      });
      continue;
    }

    const product = await Product.findById(productId);

    if (!product) {
      stockErrors.push({
        productId,
        error: `Producto no encontrado`,
      });
      continue;
    }

    const availableStock = Number(product.stock || 0);

    if (availableStock < requestedQty) {
      stockErrors.push({
        productId,
        productName: product.title || product.name,
        available: availableStock,
        requested: requestedQty,
        error: `Stock insuficiente para ${
          product.title || product.name
        }. Disponible: ${availableStock}, Solicitado: ${requestedQty}`,
      });
    }
  }

  return stockErrors;
}

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
    (acc, it) =>
      acc +
      Number(it.unit_price) * Number(it.quantity),
    0
  );

  return { items: normalized, total };
}

// Disminuir stock simple (no atómico)
async function decreaseStock(order) {
  for (const item of order.items) {
    if (!item?.productId) continue;
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: -Number(item.quantity || 1) } }
    );
  }
}

// Disminuir stock de forma atómica con sesión
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
        throw new InsufficientStockError(
          `Producto ${item.productId}`,
          "?",
          qty
        );
      }
      updated.push({ id: item.productId, qty });
    }
  } catch (err) {
    if (!session) {
      // revertir manualmente si no hay transacción
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

// -------------------------
// ROUTER DE STATS
// -------------------------
app.use("/api/stats", statsRouter);

// -------------------------
// RUTAS DE PRODUCTOS
// -------------------------
app.get(
  "/api/products",
  asyncHandler(async (req, res) => {
    const cacheKey = "all_products";
    const cached = productCache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const products = await Product.find(
      { stock: { $gte: 0 } },
      {
        title: 1,
        price: 1,
        image: 1,
        images: 1,
        stock: 1,
        category: 1,
        description: 1,
        specs: 1,
      }
    )
      .sort({ createdAt: -1 })
      .lean();

      const items = products.map((p) => ({
  ...p,
  image: p.image || (Array.isArray(p.images) && p.images[0]) || "",
}));

    productCache.set(cacheKey, items, 300);
    res.json(items);
  })
);

app.get(
  "/api/products/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new NotFoundError("Producto");
    }
    res.json(product);
  })
);

// Crear producto (con imágenes y videos)
app.post(
  "/api/products",
  requireAdmin,
  upload.fields([
    { name: "videoFiles", maxCount: 5 },
    { name: "imageFiles", maxCount: 10 },
  ]),
  asyncHandler(async (req, res) => {
    const {
      title,
      price,
      image,
      images,
      stock,
      category,
      description,
      specs,
      faqs,
      sku,
      videoUrls,
    } = req.body;

    let videos = [];
    let imagesArr = Array.isArray(images)
      ? images
      : images
      ? [images]
      : [];

    // URLs de videos desde el formulario
    if (videoUrls) {
      if (Array.isArray(videoUrls)) videos = videos.concat(videoUrls);
      else if (
        typeof videoUrls === "string" &&
        videoUrls.trim() !== ""
      )
        videos.push(videoUrls);
    }

    // Archivos de video subidos
    if (req.files && req.files.videoFiles) {
      videos = videos.concat(
        req.files.videoFiles.map(
          (f) => `/uploads/videos/${f.filename}`
        )
      );
    }

    // Archivos de imágenes subidos
    if (req.files && req.files.imageFiles) {
      imagesArr = imagesArr.concat(
        req.files.imageFiles.map(
          (f) => `/uploads/images/${f.filename}`
        )
      );
    }

    // 🔥 CORRECCIÓN: Procesar specs correctamente
     let specsObj = {};
    try {
      if (typeof specs === 'string') {
        const parsed = JSON.parse(specs);
        if (parsed && typeof parsed === 'object') {
          // Filtrar campos vacíos
          Object.entries(parsed).forEach(([key, value]) => {
            if (key && key.trim() !== '' && value && String(value).trim() !== '') {
              specsObj[key.trim()] = value;
            }
          });
        }
      } else if (specs && typeof specs === 'object') {
        Object.entries(specs).forEach(([key, value]) => {
          if (key && key.trim() !== '' && value && String(value).trim() !== '') {
            specsObj[key.trim()] = value;
          }
        });
      }
      
      logger.info('📝 Specs procesadas para crear:', specsObj);
    } catch (e) {
      logger.error('❌ Error parseando specs:', e);
    }

    // 🔥 CORRECCIÓN: Procesar FAQs correctamente
    let faqsArray = [];
    try {
      if (typeof faqs === 'string') {
        faqsArray = JSON.parse(faqs);
      } else if (Array.isArray(faqs)) {
        faqsArray = faqs;
      }
      
      // Filtrar FAQs vacías
      faqsArray = faqsArray.filter(faq => 
        faq.question && faq.question.trim() !== '' && 
        faq.answer && faq.answer.trim() !== ''
      );
    } catch (e) {
      logger.error('❌ Error parseando faqs:', e);
    }

    const product = await Product.create({
      title,
      price,
      image: image || imagesArr[0] || "",
      images: imagesArr,
      stock,
      category,
      description,
      specs: specsObj,
      faqs: faqsArray,
      sku: sku || `SKU-${Date.now()}`,
      videos,
    });

    logger.info('✅ Producto creado:', product._id);
    productCache.clear();
    res.status(201).json(product);
  })
);

// Actualizar producto
app.patch(
  "/api/products/:id",
  requireAdmin,
  upload.fields([
    { name: "videoFiles", maxCount: 5 },
    { name: "imageFiles", maxCount: 10 },
  ]),
  asyncHandler(async (req, res) => {
    const {
      title,
      price,
      image,
      images,
      stock,
      category,
      description,
      specs,
      faqs,
      sku,
      videoUrls,
    } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (sku !== undefined) updateData.sku = sku;

    // Manejar imágenes
    if (images !== undefined) {
      let imagesArr = Array.isArray(images) ? images : images ? [images] : [];
      
      if (req.files && req.files.imageFiles) {
        imagesArr = imagesArr.concat(
          req.files.imageFiles.map((f) => `/uploads/images/${f.filename}`)
        );
      }
      
      updateData.images = imagesArr;
      updateData.image = image || imagesArr[0] || "";
    }

    // Manejar videos
    if (videoUrls !== undefined || (req.files && req.files.videoFiles)) {
      let videos = [];
      
      if (videoUrls) {
        if (Array.isArray(videoUrls)) videos = videos.concat(videoUrls);
        else if (typeof videoUrls === "string" && videoUrls.trim() !== "")
          videos.push(videoUrls);
      }
      
      if (req.files && req.files.videoFiles) {
        videos = videos.concat(
          req.files.videoFiles.map((f) => `/uploads/videos/${f.filename}`)
        );
      }
      
      updateData.videos = videos;
    }

    // 🔥 CORRECCIÓN: Procesar specs correctamente SIN features especiales
    if (specs !== undefined) {
      try {
        let specsObj = {};
        
        if (typeof specs === 'string') {
          const parsed = JSON.parse(specs);
          if (parsed && typeof parsed === 'object') {
            Object.entries(parsed).forEach(([key, value]) => {
              if (key && key.trim() !== '' && value && String(value).trim() !== '') {
                specsObj[key.trim()] = value;
              }
            });
          }
        } else if (specs && typeof specs === 'object') {
          Object.entries(specs).forEach(([key, value]) => {
            if (key && key.trim() !== '' && value && String(value).trim() !== '') {
              specsObj[key.trim()] = value;
            }
          });
        }
        
        updateData.specs = specsObj;
        logger.info('📝 Specs procesadas para actualizar:', specsObj);
      } catch (e) {
        logger.error('❌ Error parseando specs:', e);
      }
    }

    // 🔥 CORRECCIÓN: Procesar FAQs correctamente
    if (faqs !== undefined) {
      try {
        let faqsArray = [];
        
        if (typeof faqs === 'string') {
          faqsArray = JSON.parse(faqs);
        } else if (Array.isArray(faqs)) {
          faqsArray = faqs;
        }
        
        // Filtrar FAQs vacías
        faqsArray = faqsArray.filter(faq => 
          faq.question && faq.question.trim() !== '' && 
          faq.answer && faq.answer.trim() !== ''
        );
        
        updateData.faqs = faqsArray;
      } catch (e) {
        logger.error('❌ Error parseando faqs:', e);
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) throw new NotFoundError("Producto");

    logger.info('✅ Producto actualizado:', product._id);
    productCache.clear();
    res.json(product);
  })
);

// Eliminar producto
app.delete(
  "/api/products/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new NotFoundError("Producto");

    // Eliminar imágenes
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(imgPath => {
        if (imgPath.startsWith('/uploads/images/')) {
          const filePath = imgPath.replace('/uploads/', 'uploads/');
          fs.unlink(filePath, err => {
            if (err) logger.warn(`No se pudo borrar imagen: ${filePath}`);
          });
        }
      });
    }
    // Eliminar imagen principal si no está en el array
    if (product.image && product.image.startsWith('/uploads/images/')) {
      const filePath = product.image.replace('/uploads/', 'uploads/');
      if (!product.images || !product.images.includes(product.image)) {
        fs.unlink(filePath, err => {
          if (err) logger.warn(`No se pudo borrar imagen principal: ${filePath}`);
        });
      }
    }
    // Eliminar videos
    if (product.videos && Array.isArray(product.videos)) {
      product.videos.forEach(videoPath => {
        if (videoPath.startsWith('/uploads/videos/')) {
          const filePath = videoPath.replace('/uploads/', 'uploads/');
          fs.unlink(filePath, err => {
            if (err) logger.warn(`No se pudo borrar video: ${filePath}`);
          });
        }
      });
    }

    productCache.clear();
    res.json({ message: "Producto eliminado" });
  })
);

// -------------------------
// MERCADOPAGO / PAGOS
// -------------------------

async function processMerchantOrder(moData, notificationId = null) {
  const externalReference = moData?.external_reference;
  if (!externalReference) {
    logger.warn("Merchant order sin external_reference");
    return;
  }

  // Verificar si ya se procesó el evento
  if (notificationId) {
    const alreadyProcessed = await ProcessedEvent.findOne({
      notificationId: String(notificationId),
    });

    if (alreadyProcessed) {
      logger.info(
        `Evento ${notificationId} ya fue procesado, omitiendo`
      );
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

  if (paid) {
    const totalPaid = moData.paid_amount || 0;
    const orderTotal = order.total || 0;

    if (totalPaid < orderTotal) {
      logger.warn(
        `Pago parcial detectado. Pagado: ${totalPaid}, Esperado: ${orderTotal}. Orden: ${order._id}`
      );
      return;
    }
  }

  if (paid && order.status !== "paid") {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const approved = moData.payments.find(
          (p) => p.status === "approved"
        );
        const fresh = await Order.findById(order._id).session(
          session
        );
        if (!fresh) return;
        if (fresh.status === "paid") return;

        fresh.status = "paid";
        fresh.mp_payment_id =
          approved?.id?.toString() || fresh.mp_payment_id;
        await fresh.save({ session });

        await decreaseStockAtomic(fresh, session);

        if (notificationId) {
          await ProcessedEvent.create(
            [
              {
                notificationId: String(notificationId),
                notificationType: "merchant_order",
                orderId: String(fresh._id),
                status: "paid",
              },
            ],
            { session }
          );
        }
      });
      logger.info(
        `Orden ${order._id} marcada como PAID y stock actualizado (atómico)`
      );
    } finally {
      session.endSession();
    }
  } else {
    logger.info(`Orden ${order._id} - Status actual: ${order.status}`);
  }
}

// Crear preferencia
app.post(
  "/api/payments/preference",
  paymentLimiter,
  validate(createOrderSchema),
  asyncHandler(async (req, res) => {
    const { items, buyer } = req.body;

    const stockErrors = await validateStock(items);
    if (stockErrors.length > 0) {
      throw new AppError(
        `Problemas con el stock: ${stockErrors
          .map((e) => e.error)
          .join(", ")}`,
        400
      );
    }

    const { items: normalizedItems, total } =
      await normalizeItemsFromDB(items);

    const order = await Order.create({
      items: normalizedItems,
      buyer,
      total,
      status: "pending",
    });

    const FRONTEND_BASE_RAW =
      process.env.FRONTEND_URL ||
      req.headers.origin ||
      "http://localhost:5173";
    const FRONTEND_BASE = String(FRONTEND_BASE_RAW)
      .trim()
      .replace(/\/$/, "");

    const backendBaseRaw =
      process.env.BACKEND_PUBLIC_URL ||
      `${req.protocol}://${req.get("host")}`;
    const backendBase = String(backendBaseRaw)
      .trim()
      .replace(/\/$/, "");

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
        /auto_return invalid|back_url\.success must be defined/i.test(
          msg
        );
      if (looksLikeAutoReturn) {
        const { auto_return, ...withoutAutoReturn } =
          preferenceBody;
        logger.warn(
          "MP create retry sin auto_return debido a:",
          msg || code
        );
        result = await preferenceClient.create({
          body: withoutAutoReturn,
        });
      } else {
        throw err;
      }
    }

    const prefId = result?.id || result?.body?.id;
    const initPoint =
      result?.init_point || result?.body?.init_point;

    order.mp_preference_id = prefId;
    await order.save();

    logger.info(
      `Preferencia MP creada: ${prefId} para orden ${order._id}`
    );

    res.json({ init_point: initPoint, id: prefId, orderId: order._id });
  })
);

// Procesar pago directo (Checkout Bricks)
app.post(
  "/api/payments/process",
  paymentLimiter,
  asyncHandler(async (req, res) => {
    const {
      token,
      items,
      buyer,
      description,
      payment_method_id,
      issuer_id,
      payer,
      installments,
    } = req.body;

    logger.info("Datos recibidos en /api/payments/process:", {
      has_token: !!token,
      has_items: !!items,
      has_buyer: !!buyer,
      payment_method_id,
      issuer_id,
      client_amount: req.body?.transaction_amount,
      payer_email: payer?.email,
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

    const stockErrors = await validateStock(items);
    if (stockErrors.length > 0) {
      throw new AppError(
        `Problemas con el stock: ${stockErrors
          .map((e) => e.error)
          .join(", ")}`,
        400
      );
    }

    const { items: normalizedItems, total: expectedTotal } =
      await normalizeItemsFromDB(items);

    const paymentClient = new Payment(client);

    const paymentData = {
      transaction_amount: Number(expectedTotal),
      description: description || `Compra en Etronix Store`,
      payment_method_id,
      installments: Number(installments) || 1,
      payer: {
        email: payer?.email || buyer.email || "test@test.com",
      },
    };

    if (payer?.first_name) {
      paymentData.payer.first_name = payer.first_name;
    }
    if (payer?.last_name) {
      paymentData.payer.last_name = payer.last_name;
    }
    if (token) {
      paymentData.token = token;
    }
    if (issuer_id) {
      paymentData.issuer_id = issuer_id;
    }
    if (payer?.identification) {
      paymentData.payer.identification = payer.identification;
    }

    logger.info(`Procesando pago con MercadoPago`, {
      amount: expectedTotal,
      email: payer?.email || buyer.email,
      payment_method: payment_method_id,
      has_token: !!token,
      issuer_id,
    });

    const payment = await paymentClient.create({ body: paymentData });
    const paymentBody = payment?.body || payment;

    logger.info(
      `Pago creado: ${paymentBody.id}, status: ${paymentBody.status}, detail: ${paymentBody.status_detail}`
    );

    if (paymentBody.status === "approved") {
      const session = await mongoose.startSession();
      let newOrder;
      try {
        await session.withTransaction(async () => {
          newOrder = new Order({
            items: normalizedItems,
            buyer,
            total: expectedTotal,
            status: "paid",
            mp_payment_id: String(paymentBody.id),
          });
          await newOrder.save({ session });
          await decreaseStockAtomic(newOrder, session);
        });
      } catch (err) {
        logger.error(
          "Error transaccional creando orden pagada:",
          err.message
        );
        throw err;
      } finally {
        session.endSession();
      }

      logger.info(
        `Orden ${newOrder._id} creada con status PAID (stock descontado atómicamente)`
      );

      return res.json({
        success: true,
        status: "approved",
        orderId: newOrder._id,
        paymentId: paymentBody.id,
      });
    } else if (paymentBody.status === "rejected") {
      logger.warn(`Pago rechazado: ${paymentBody.status_detail}`);

      return res.json({
        success: false,
        status: "rejected",
        message:
          paymentBody.status_detail || "Pago rechazado",
      });
    } else {
      logger.info(`Pago en proceso: ${paymentBody.status}`);

      return res.json({
        success: false,
        status: paymentBody.status,
        message: "Pago en proceso",
      });
    }
  })
);

// Log de webhook
app.use((req, _res, next) => {
  if (req.path.startsWith("/api/payments/webhook")) {
    logger.info(
      `🔔 Webhook recibido: ${req.method} ${req.originalUrl}`
    );
  }
  next();
});

// Webhook (GET y POST)
app.all(
  "/api/payments/webhook",
  asyncHandler(async (req, res) => {
    const { type, topic, id, "data.id": dataId } = req.query;
    const notifType = type || topic;
    const notifId = dataId || id;

    logger.info("Webhook params:", req.query);

    if (!notifId) {
      logger.warn("Webhook sin notifId, ignorando");
      return res.sendStatus(200);
    }

    if (notifType === "payment" && notifId) {
      const paymentClient = new Payment(client);
      const p = await paymentClient.get({ id: notifId });
      const orderId = p?.body?.order?.id;

      logger.info(
        `Payment ${notifId} obtenido, merchant_order: ${orderId}`
      );

      if (orderId) {
        const merchantOrderClient = new MerchantOrder(client);
        const mo = await merchantOrderClient.get({
          merchantOrderId: orderId,
        });
        await processMerchantOrder(mo?.body || mo, notifId);
      }

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
      const mo = await merchantOrderClient.get({
        merchantOrderId: notifId,
      });
      await processMerchantOrder(mo?.body || mo, notifId);
    }

    res.sendStatus(200);
  })
);

// -------------------------
// ÓRDENES
// -------------------------
app.get(
  "/api/orders/:id",
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new NotFoundError("Orden");
    }
    res.json(order);
  })
);

app.get(
  "/api/orders",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};

    if (
      status &&
      [
        "pending",
        "paid",
        "failed",
        "processing",
        "shipped",
        "delivered",
      ].includes(status)
    ) {
      query.status = status;
    }

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
          options: { strictPopulate: false },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  })
);

app.patch(
  "/api/orders/:id",
  requireAdmin,
  validate(updateOrderStatusSchema),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw new NotFoundError("Orden");
    order.status = status;
    await order.save();
    res.json(order);
  })
);

// -------------------------
// MIDDLEWARES DE ERROR
// -------------------------
app.use(notFoundHandler);
app.use(errorHandler);

// -------------------------
// SERVER
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Backend corriendo en puerto ${PORT}`);
});
