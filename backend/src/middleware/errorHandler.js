// errorHandler.js
import logger from "../config/logger.js";

/**
 * Clase personalizada para errores de la aplicación
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para manejo centralizado de errores
 */
export const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.error("Error capturado:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || 500,
    isOperational: err.isOperational,
  });

  // Error operacional vs error de programación
  if (err.isOperational !== false) {
    // Errores esperados (operacionales)
    return res.status(err.statusCode || 500).json({
      error: err.message,
      timestamp: err.timestamp || new Date().toISOString(),
      path: req.path,
    });
  }

  // Errores de programación o inesperados
  // No exponer detalles sensibles en producción
  if (process.env.NODE_ENV === "production") {
    return res.status(500).json({
      error: "Error interno del servidor",
      timestamp: new Date().toISOString(),
    });
  }

  // En desarrollo, mostrar más detalles
  res.status(err.statusCode || 500).json({
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

/**
 * Middleware para capturar errores de rutas no encontradas
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

/**
 * Wrapper para funciones async en rutas
 * Captura errores automáticamente y los pasa al middleware de errores
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Errores específicos para diferentes situaciones
 */
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} no encontrado`, 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso prohibido") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto con el estado actual del recurso") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class InsufficientStockError extends AppError {
  constructor(productName, available, requested) {
    super(
      `Stock insuficiente para ${productName}. Disponible: ${available}, Solicitado: ${requested}`,
      400
    );
    this.name = "InsufficientStockError";
    this.productName = productName;
    this.available = available;
    this.requested = requested;
  }
}
