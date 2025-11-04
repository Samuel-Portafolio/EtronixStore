# 💡 Guía Rápida para el Profesor

## 🎯 Solución a tu Problema

Esta tienda online resuelve tus desafíos de atención al cliente:

### ✅ Antes (Problemas):
- ❌ No puedes responder a tiempo por trabajo en el colegio
- ❌ Clientes frustrados esperando respuestas
- ❌ Pérdida de ventas por falta de disponibilidad
- ❌ Repetir la misma información constantemente

### ✅ Ahora (Soluciones):
- ✅ Los clientes ven productos 24/7 con toda la información
- ✅ El chatbot responde preguntas automáticamente
- ✅ Sistema de pagos automático
- ✅ Tú solo te encargas de comprar y enviar cuando hay pedidos

---

## 🚀 Cómo Empezar (Paso a Paso)

### 1️⃣ Primera Vez - Configuración (Una sola vez)

1. **Instalar Node.js**
   - Descargar de https://nodejs.org
   - Instalar versión LTS (Long Term Support)

2. **Crear cuenta en MongoDB Atlas** (Base de datos GRATIS)
   - Ir a https://www.mongodb.com/cloud/atlas/register
   - Crear cuenta gratuita
   - Crear un cluster (toma 5 minutos)
   - Obtener la connection string (URI)

3. **Crear cuenta en Mercado Pago**
   - Ya tienes? Usar la misma
   - Ir a Developers → Credenciales
   - Copiar el "Access Token"

4. **Configurar el proyecto**
   ```bash
   # Abrir PowerShell en la carpeta del proyecto
   cd backend
   npm install
   
   cd ../frontend
   npm install
   ```

5. **Crear archivos .env** (ver README_COMPLETO.md)

6. **Cargar productos**
   ```bash
   cd backend
   npm run seed:productos
   ```

### 2️⃣ Uso Diario

**Cada vez que quieras usar el sistema:**

```bash
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)  
cd frontend
npm run dev
```

Luego abrir en el navegador: http://localhost:5173

---

## 📱 Flujo de Trabajo Recomendado

### Mañana (Antes de ir al colegio):
1. Abrir el panel de admin
2. Revisar si hay nuevos pedidos de la noche
3. Anotar qué productos comprar

### Tarde (Después del colegio):
1. Comprar los productos de los pedidos
2. Actualizar estado de pedidos a "Procesando"
3. Contactar clientes por WhatsApp (botón directo en el panel)
4. Coordinar envíos y costos

### Noche:
1. Actualizar pedidos enviados a "Enviado"
2. Revisar nuevos pedidos del día

---

## 💬 Personalizaciones Importantes

### 1. Cambiar Número de WhatsApp

Buscar en estos archivos y reemplazar `+57 300 123 4567` con tu número:

- `frontend/src/components/Chatbot.jsx`
- `frontend/src/components/FAQ.jsx`
- `frontend/src/pages/ProductDetail.jsx`

### 2. Agregar tus Productos Reales

**Opción 1: Modificar el script de seed**
- Editar `backend/scripts/seedProductosReales.js`
- Cambiar precios, descripciones, imágenes
- Agregar/quitar productos

**Opción 2: Crear productos desde código**
Puedes crear más adelante un panel para agregar productos desde la web.

### 3. Personalizar el Chatbot

En `frontend/src/components/Chatbot.jsx`, buscar `knowledgeBase` para:
- Cambiar respuestas automáticas
- Agregar nuevas preguntas frecuentes
- Modificar el tono de las respuestas

---

## 📊 Reporte Diario Recomendado

Crea un hábito de revisar:

1. **Total de pedidos nuevos** (filtro "Pendiente")
2. **Pedidos pagados** (necesitan ser procesados)
3. **Pedidos en camino** (próximos a entregar)

Puedes tomar nota en un cuaderno:
```
Fecha: 04/11/2024
- Nuevos pedidos: 3
- Productos a comprar: Audífonos JBL (2), Cable USB-C (1)
- Envíos coordinados: 2
- Por enviar: 1
```

---

## 💰 Costos y Comisiones

### Mercado Pago:
- Cobra comisión por transacción (~3.5% + IVA)
- Esto se descuenta automáticamente
- **Importante**: Incluir esto en tus precios

### Ejemplo de Precio:
- Costo del producto: $100.000
- Comisión MP (4%): $4.000
- Ganancia deseada: $20.000
- **Precio de venta**: $124.000

### MongoDB Atlas:
- Plan gratuito es suficiente para empezar
- Incluye 512MB de almacenamiento
- Suficiente para miles de productos y pedidos

---

## 🎓 Tips para Aumentar Ventas

1. **Fotos de Calidad**
   - Tomar fotos reales de tus productos
   - Buena iluminación
   - Fondo limpio

2. **Descripciones Completas**
   - Responder TODAS las preguntas en la descripción
   - Entre más info, menos dudas = más ventas

3. **Redes Sociales**
   - Compartir link de la tienda en Instagram/Facebook
   - Hacer posts de productos destacados
   - "Link en bio" → tu tienda

4. **Ofertas y Promociones**
   - Combos (Ej: Audífonos + Estuche = 10% descuento)
   - Envío gratis en compras grandes
   - Actualizar precios en el seed

5. **Horarios de Respuesta WhatsApp**
   - Poner en el chatbot tus horarios reales
   - "Respondo en máximo 2 horas"
   - Ser transparente genera confianza

---

## 🆘 Solución de Problemas Comunes

### "No se conecta a MongoDB"
- Verificar que la URI está correcta en `.env`
- Verificar que agregaste tu IP en MongoDB Atlas (Network Access)

### "Mercado Pago no funciona"
- Verificar el Access Token
- Asegurarse que la cuenta está activada
- Revisar que FRONTEND_URL está correcto

### "Los productos no aparecen"
- Verificar que ejecutaste `npm run seed:productos`
- Revisar la conexión a MongoDB
- Abrir MongoDB Compass y verificar la base de datos

### "El carrito se borra al recargar"
- Es normal en desarrollo
- En producción, usar localStorage (ya implementado)

---

## 📈 Próximos Pasos (Opcional)

Cuando domines el sistema básico, puedes:

1. **Agregar más funcionalidades**
   - Sistema de cupones de descuento
   - Programa de puntos/fidelidad
   - Reseñas de productos

2. **Integraciones**
   - Google Analytics (ver qué productos más ven)
   - Facebook Pixel (retargeting)
   - Email marketing

3. **Automatizaciones**
   - Emails automáticos de confirmación
   - Recordatorios de carrito abandonado
   - Notificaciones push

---

## 📞 Necesitas Ayuda?

Si tienes dudas sobre el código o funcionamiento:

1. Revisar el README_COMPLETO.md
2. Buscar en Google el error específico
3. Consultar la documentación de:
   - React: https://react.dev
   - Express: https://expressjs.com
   - Mercado Pago: https://www.mercadopago.com.co/developers

---

## ✨ Mensaje Final

**Este sistema NO reemplaza tu atención personal**, pero sí:
- ✅ Filtra clientes serios (los que pagan ya están listos)
- ✅ Reduce preguntas básicas (el chatbot las responde)
- ✅ Te da tiempo (atiendes cuando puedas)
- ✅ Aumenta ventas (tienda abierta 24/7)

**Tu trabajo ahora es**:
1. Comprar los productos cuando haya pedidos pagados
2. Enviar con información del cliente (ya capturada)
3. Dar seguimiento por WhatsApp a envíos

**El sistema se encarga de**:
- Mostrar productos
- Responder preguntas básicas
- Procesar pagos
- Organizar pedidos

---

**¡Éxito con tu negocio! 🚀**

Recuerda: La consistencia es clave. Mantén actualizado el stock y responde WhatsApp cuando tengas tiempo. Los clientes valorarán la transparencia.
