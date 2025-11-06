// Middleware para proteger endpoints de administrador
export const requireAdmin = (req, res, next) => {
  const adminCode = req.headers["x-admin-code"];
  
  if (!adminCode) {
    return res.status(401).json({ 
      error: "No autorizado. Se requiere código de administrador" 
    });
  }

  if (adminCode !== process.env.ADMIN_CODE) {
    return res.status(403).json({ 
      error: "Código de administrador inválido" 
    });
  }

  next();
};
