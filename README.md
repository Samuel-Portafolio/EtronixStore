# 🛒 Etronix Store - E-commerce con Mercado Pago

Tienda online de accesorios para celulares con integración completa de Mercado Pago, sistema de gestión de órdenes y características avanzadas de seguridad.

## 🌟 Características Principales

### 💳 Pagos
- ✅ Integración completa con Mercado Pago
- ✅ Webhooks para actualización automática de estados
- ✅ Prevención de pagos duplicados
- ✅ Validación de montos
- ✅ Rate limiting en endpoints de pago

### 🔒 Seguridad
- ✅ Helmet para headers de seguridad
- ✅ Rate limiting (100 req/15min general, 10 req/min pagos)
- ✅ Sanitización de inputs MongoDB
- ✅ Validación de datos con Joi
- ✅ Autenticación admin con tokens
- ✅ Variables de entorno protegidas

### 📊 API Robusta
- ✅ Paginación en listados
- ✅ Filtros por estado
- ✅ Búsqueda por cliente
- ✅ Índices optimizados en MongoDB
- ✅ Logs estructurados con Winston

### 🎨 Frontend Moderno
- ✅ React + Vite
- ✅ TailwindCSS
- ✅ Code splitting con React.lazy
- ✅ SEO optimizado
- ✅ Meta tags Open Graph y Twitter Cards
- ✅ Schema.org structured data

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ 
- MongoDB
- Cuenta de Mercado Pago (modo sandbox o producción)

### Instalación Automática (Windows)

```powershell
# Ejecutar script de setup
.\setup.ps1
```

Este script:
1. Copia `.env.example` a `.env`
2. Genera un código de administrador seguro
3. Crea directorios necesarios
4. Opcionalmente instala dependencias

### Instalación Manual

#### 1. Backend

```bash
cd backend

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales
# - MONGODB_URI
# - MP_ACCESS_TOKEN
# - ADMIN_CODE (genera uno aleatorio)
# - FRONTEND_URL
# - BACKEND_PUBLIC_URL

# Instalar dependencias
npm install

# Crear directorio de logs
mkdir logs

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

#### 2. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

### Generar ADMIN_CODE Seguro

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## 📁 Estructura del Proyecto

```
etronix-store/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── logger.js          # Configuración de Winston
│   │   ├── middleware/
│   │   │   └── auth.js            # Middleware de autenticación
│   │   ├── models/
│   │   │   ├── Order.js           # Modelo de órdenes
│   │   │   ├── Product.js         # Modelo de productos
│   │   │   └── ProcessedEvent.js  # Eventos de webhook procesados
│   │   ├── validators/
│   │   │   └── orderValidators.js # Validación con Joi
│   │   └── db.js                  # Conexión MongoDB
│   ├── logs/                      # Logs de aplicación
│   ├── scripts/                   # Scripts de seed
│   ├── .env.example              # Plantilla de variables
│   ├── server.js                 # Servidor Express
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Componentes React
│   │   ├── pages/                # Páginas/Rutas
│   │   ├── context/              # Context API
│   │   ├── constants/            # Constantes
│   │   └── main.jsx              # Entry point con lazy loading
│   ├── public/
│   │   ├── robots.txt            # SEO
│   │   └── sitemap.xml           # SEO
│   ├── index.html                # HTML con meta tags SEO
│   └── package.json
├── .gitignore
├── setup.ps1                     # Script de setup automático
├── MEJORAS_NOVIEMBRE_2025.md     # Documentación de mejoras
└── README.md
```

## 🔌 API Endpoints

### Públicos

```
GET  /api/health              # Health check
GET  /api/products            # Listar productos
GET  /api/products/:id        # Detalle de producto
GET  /api/orders/:id          # Detalle de orden específica
POST /api/payments/preference # Crear preferencia de pago
ALL  /api/payments/webhook    # Webhook de Mercado Pago
```

### Protegidos (Requieren `x-admin-code` header)

```
GET   /api/orders              # Listar todas las órdenes (paginado)
PATCH /api/orders/:id          # Actualizar estado de orden
```

### Ejemplos de Uso

**Listar órdenes con filtros:**
```javascript
fetch('/api/orders?status=paid&page=1&limit=10', {
  headers: {
    'x-admin-code': 'TU_CODIGO_ADMIN'
  }
})
```

**Actualizar estado de orden:**
```javascript
fetch('/api/orders/ORDER_ID', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-code': 'TU_CODIGO_ADMIN'
  },
  body: JSON.stringify({ status: 'shipped' })
})
```

## 🛡️ Seguridad

### Variables de Entorno

**NUNCA subas el archivo `.env` a git.** Usa `.env.example` como referencia.

### Endpoints Admin

Los endpoints de administración están protegidos con un código secreto en el header `x-admin-code`. Guarda este código de forma segura.

### Rate Limiting

- General: 100 peticiones / 15 minutos
- Pagos: 10 peticiones / minuto

### Validación de Datos

Todos los inputs son validados con esquemas Joi antes de procesarse.

## 📊 Logs

Los logs se guardan en `backend/logs/`:

- `combined.log` - Todos los logs
- `error.log` - Solo errores

**Ver logs en tiempo real:**
```bash
# Unix/Mac
tail -f backend/logs/combined.log

# Windows PowerShell
Get-Content backend/logs/combined.log -Wait -Tail 50
```

## 🎯 SEO

### Implementado
- ✅ Meta tags completos
- ✅ Open Graph (Facebook)
- ✅ Twitter Cards
- ✅ Schema.org Organization
- ✅ robots.txt
- ✅ sitemap.xml
- ✅ Canonical URLs

### Pendiente
- Schema.org Product en páginas de producto
- Sitemap dinámico con productos
- Prerendering/SSR para mejor indexación

## 🧪 Testing

### Webhooks de Mercado Pago

Para probar webhooks localmente, usa ngrok:

```bash
# Instalar ngrok
# https://ngrok.com/download

# Exponer puerto 3000
ngrok http 3000

# Usar la URL HTTPS en BACKEND_PUBLIC_URL
# Ejemplo: https://abc123.ngrok.io
```

Luego actualiza la `notification_url` en la preferencia o configura el webhook en el panel de Mercado Pago.

## 📈 Rendimiento

### Code Splitting
Todas las rutas usan React.lazy para cargar bajo demanda.

### Índices MongoDB
Índices optimizados en:
- Orders: createdAt, external_reference, status, buyer.email
- Products: sku, category, texto completo, price

### Paginación
El endpoint `/api/orders` soporta paginación para evitar consultas pesadas.

## 🔄 Estados de Órdenes

- `pending` - Orden creada, pago pendiente
- `paid` - Pago confirmado
- `failed` - Pago fallido
- `processing` - Orden en procesamiento
- `shipped` - Orden enviada
- `delivered` - Orden entregada

## 🛠️ Próximos Pasos

Ver [MEJORAS_NOVIEMBRE_2025.md](./MEJORAS_NOVIEMBRE_2025.md) sección "Próximos Pasos" para roadmap completo.

Prioridades:
1. Schema.org Product en ProductDetail
2. Optimización de imágenes (WebP/AVIF)
3. Auditoría de accesibilidad
4. Tests unitarios y E2E
5. PWA con Service Workers

## 📝 Scripts Disponibles

### Backend
```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
npm run seed     # Seed de productos demo
npm run seed:productos  # Seed de productos reales
```

### Frontend
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 👨‍💻 Autor

Etronix Store - 2025

## 🙏 Agradecimientos

- Mercado Pago por su excelente SDK
- React & Vite por las herramientas de desarrollo
- TailwindCSS por el sistema de diseño

---

**¿Preguntas?** Revisa [MEJORAS_NOVIEMBRE_2025.md](./MEJORAS_NOVIEMBRE_2025.md) para documentación detallada de todas las características implementadas.
