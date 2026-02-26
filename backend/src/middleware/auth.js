import rateLimit from "express-rate-limit";
import crypto from "crypto";

// Bloquea IPs que fallen más de 10 veces en 15 minutos
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { error: "Demasiados intentos fallidos. Espera 15 minutos." },
  keyGenerator: (req) => req.ip,
});

export const requireAdmin = (req, res, next) => {
  const adminCode = req.headers["x-admin-code"];

  if (!adminCode) {
    return res.status(401).json({ error: "No autorizado." });
  }

  // Comparación segura que evita timing attacks
  const provided = Buffer.from(adminCode);
  const expected = Buffer.from(process.env.ADMIN_CODE || "");

  if (
    provided.length !== expected.length ||
    !crypto.timingSafeEqual(provided, expected)
  ) {
    return res.status(403).json({ error: "Código inválido." });
  }

  next();
};