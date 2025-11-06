import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Escribir todos los logs en archivo combined.log
    new winston.transports.File({ filename: "logs/combined.log" }),
    // Escribir logs de error en archivo separado
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  ],
});

// Si no estamos en producción, también loguear a consola
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
