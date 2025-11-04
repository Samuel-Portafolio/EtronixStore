# 🛍️ Etronix Store - Tienda Online de Accesorios para Celulares

## 📋 Descripción

Tienda online completa para venta de accesorios de celulares con las siguientes características:

### ✨ Características Principales

1. **🛒 Catálogo de Productos Completo**
   - Productos con descripciones detalladas
   - Especificaciones técnicas completas
   - Preguntas frecuentes por producto
   - Imágenes de alta calidad
   - Control de stock en tiempo real

2. **🤖 Chatbot Inteligente**
   - Asistente virtual 24/7
   - Responde preguntas sobre productos, envíos, pagos, garantías
   - Preguntas frecuentes integradas
   - Contacto directo a WhatsApp

3. **💳 Sistema de Pagos**
   - Integración con Mercado Pago
   - Múltiples métodos de pago (tarjetas, PSE, efectivo)
   - Proceso de checkout seguro
   - Captura completa de datos para envío

4. **📦 Panel de Administración**
   - Vista de todos los pedidos en tiempo real
   - Gestión de estados de pedidos
   - Notificaciones de nuevos pedidos
   - Información completa del cliente para envíos
   - Botón directo de WhatsApp para contactar clientes

5. **❓ Sección de Preguntas Frecuentes**
   - FAQ general sobre compras, envíos, garantías
   - Reduce consultas repetitivas
   - Mejora la experiencia del usuario

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- MongoDB (local o MongoDB Atlas)
- Cuenta de Mercado Pago

### 1. Clonar el repositorio
```bash
git clone https://github.com/Mejia1406/EtronixStore.git
cd EtronixStore
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:
```env
MONGODB_URI=tu_mongodb_uri
MP_ACCESS_TOKEN=tu_access_token_de_mercadopago
PORT=3000
FRONTEND_URL=http://localhost:5173
BACKEND_PUBLIC_URL=http://localhost:3000
```

**Importante:** Para obtener tu Access Token de Mercado Pago:
1. Crear cuenta en https://www.mercadopago.com.co
2. Ir a Developers > Credenciales
3. Copiar el Access Token de producción

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env` en la carpeta `frontend`:
```env
VITE_API_URL=http://localhost:3000
```

### 4. Poblar la Base de Datos

Ejecutar el script de seed con productos reales:
```bash
cd backend
npm run seed:productos
```

Esto creará productos de ejemplo con:
- Audífonos (AirPods, JBL, Samsung)
- Cargadores (rápidos, inalámbricos, power banks)
- Cables (Lightning, USB-C)
- Protectores y fundas
- Memorias y accesorios

### 5. Ejecutar la Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📱 Uso del Sistema

### Para Clientes

1. **Explorar Productos**
   - Navegar por el catálogo
   - Ver detalles completos de cada producto
   - Leer especificaciones y FAQs

2. **Hacer una Compra**
   - Agregar productos al carrito
   - Ir al checkout
   - Completar datos de envío (nombre, teléfono, dirección, ciudad)
   - Proceder al pago con Mercado Pago

3. **Usar el Chatbot**
   - Click en el botón flotante de chat
   - Hacer preguntas sobre productos, envíos, garantías
   - Obtener respuestas instantáneas

### Para el Administrador

1. **Acceder al Panel de Admin**
   - Ir a `/admin`
   - Ver todos los pedidos

2. **Gestionar Pedidos**
   - Filtrar por estado (pendiente, pagado, procesando, enviado, entregado)
   - Cambiar estado de pedidos
   - Ver información completa del cliente
   - Contactar clientes por WhatsApp

3. **Estadísticas**
   - Visualizar total de pedidos por estado
   - Actualización automática cada 30 segundos

## 🎨 Personalización

### Cambiar Información de Contacto

**En el Chatbot** (`frontend/src/components/Chatbot.jsx`):
```javascript
// Línea 102 - Cambiar número de WhatsApp
"Contáctanos por WhatsApp:\n+57 300 123 4567\n\n..."
```

**En FAQ** (`frontend/src/components/FAQ.jsx`):
```javascript
// Línea 215 - URL de WhatsApp
href="https://wa.me/573001234567?text=Hola,%20tengo%20una%20pregunta"
```

**En ProductDetail** (`frontend/src/pages/ProductDetail.jsx`):
```javascript
// Buscar "wa.me" y actualizar el número
```

### Agregar Más Productos

1. Editar `backend/scripts/seedProductosReales.js`
2. Agregar objetos de producto siguiendo la estructura
3. Ejecutar `npm run seed:productos`

### Cambiar Colores y Estilos

Los colores principales están en `frontend/src/index.css` usando variables CSS.

## 📊 Estados de Pedidos

- **pending**: Pago pendiente
- **paid**: Pago confirmado
- **processing**: Preparando el pedido
- **shipped**: Pedido enviado
- **delivered**: Pedido entregado
- **failed**: Pago fallido

## 🔒 Seguridad

- Todos los pagos son procesados por Mercado Pago (PCI DSS compliant)
- No almacenamos información de tarjetas
- Validación de datos en frontend y backend
- Variables de entorno para información sensible

## 🚢 Despliegue en Producción

### Backend (Render, Railway, etc.)

1. Subir código a GitHub
2. Conectar con servicio de hosting
3. Configurar variables de entorno
4. Desplegar

### Frontend (Vercel, Netlify, etc.)

1. Conectar repositorio
2. Configurar `VITE_API_URL` con la URL del backend
3. Desplegar

## 📞 Soporte

Para preguntas o problemas:
- WhatsApp: +57 300 123 4567 (cambiar por tu número)
- Email: soporte@etronix.com (cambiar por tu email)

## 🎯 Ventajas de la Solución

✅ **Disponibilidad 24/7**: Los clientes pueden comprar en cualquier momento
✅ **Chatbot Automático**: Reduce tiempo de respuesta a consultas comunes
✅ **Información Completa**: Clientes bien informados = menos devoluciones
✅ **Proceso Simple**: Checkout optimizado para conversión
✅ **Gestión Eficiente**: Panel admin muestra toda la info necesaria para envíos
✅ **WhatsApp Integrado**: Contacto rápido cuando se necesita atención personal

## 📝 Licencia

MIT License - Libre para usar y modificar

---

**Desarrollado para resolver el problema de disponibilidad y atención al cliente en negocios de accesorios para celulares** 🚀
