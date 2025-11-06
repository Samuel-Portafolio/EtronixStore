// Middleware personalizado para sanitizar MongoDB en Express 5
// Compatible con la nueva arquitectura de Express 5

const sanitize = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // Remover operadores MongoDB peligrosos
    return obj.replace(/\$/g, '').replace(/\./g, '');
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Remover keys que contengan $ o .
        const sanitizedKey = key.replace(/\$/g, '').replace(/\./g, '');
        sanitized[sanitizedKey] = sanitize(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

export const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  if (req.query) {
    // En Express 5, req.query es read-only, así que creamos una copia
    const sanitizedQuery = sanitize({ ...req.query });
    // Reemplazamos usando Object.defineProperty
    Object.defineProperty(req, 'query', {
      value: sanitizedQuery,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }
  next();
};
