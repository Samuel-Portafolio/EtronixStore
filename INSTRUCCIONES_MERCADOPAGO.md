# 🔧 Configuración de MercadoPago - Solución Error "Secure Fields failed"

## ⚠️ Problema
El error "The integration with Secure Fields failed" ocurre porque las credenciales de MercadoPago no son válidas o están mal configuradas.

## ✅ Solución

### 1. Obtener Credenciales Nuevas

1. Ve a: https://www.mercadopago.com.co/developers/panel
2. Inicia sesión con tu cuenta de MercadoPago
3. Crea una nueva aplicación o selecciona una existente
4. Ve a la sección **"Credenciales"**
5. Asegúrate de estar en **"Credenciales de prueba"** (pestaña de arriba)
6. Copia:
   - **Public key** (comienza con `TEST-...`)
   - **Access token** (comienza con `TEST-...`)

### 2. Actualizar Backend (.env)

Archivo: `backend/.env`

```properties
MP_PUBLIC_KEY=TEST-tu-nueva-public-key-aqui
MP_ACCESS_TOKEN=TEST-tu-nuevo-access-token-aqui
```

### 3. Actualizar Frontend (.env)

Archivo: `frontend/.env`

```properties
VITE_MP_PUBLIC_KEY=TEST-tu-nueva-public-key-aqui
```

**⚠️ IMPORTANTE**: La `Public key` debe ser la MISMA en ambos archivos.

### 4. Reiniciar Servidores

```powershell
# En la terminal del backend
cd backend
# Ctrl+C para detener (si está corriendo)
node server.js

# En otra terminal para el frontend
cd frontend
# Ctrl+C para detener (si está corriendo)
npm run dev
```

### 5. Limpiar Caché del Navegador

1. Abre el navegador
2. Presiona `Ctrl + Shift + Delete`
3. Limpia caché y cookies
4. O simplemente presiona `Ctrl + F5` para hacer hard refresh

## 🧪 Probar con Tarjetas de Prueba

MercadoPago proporciona tarjetas de prueba para Colombia:

### ✅ Tarjeta que APRUEBA el pago
- **Número**: `4013 5406 8274 6260`
- **CVV**: `123`
- **Fecha**: Cualquier fecha futura (ej: 12/25)
- **Nombre**: APRO
- **Documento**: 12345678

### ❌ Tarjeta que RECHAZA el pago
- **Número**: `4013 5406 8274 6260`
- **CVV**: `123`
- **Fecha**: Cualquier fecha futura
- **Nombre**: OTHE
- **Documento**: 12345678

Más tarjetas de prueba: https://www.mercadopago.com.co/developers/es/docs/checkout-bricks/additional-content/test-cards

## 🔍 Verificar que funciona

1. Ve al checkout: `http://localhost:5173/checkout`
2. Agrega productos al carrito
3. Llena el formulario de envío
4. Click en "Continuar al Pago"
5. **Deberías ver el formulario de pago de MercadoPago sin errores**
6. Usa una tarjeta de prueba
7. Si el pago es aprobado, la orden se crea en el admin

## 📊 Mejoras Implementadas

### ✅ Ya NO se crean órdenes en "pending"
- Antes: La orden se creaba al hacer click en "Continuar al Pago"
- Ahora: La orden se crea SOLO cuando el pago es aprobado
- Beneficio: Panel de admin más limpio, sin órdenes fantasma

### ✅ Mejor manejo de errores
- Mensajes más claros
- Logs detallados en consola
- Validación del monto

### ✅ Cambiado a Payment Brick
- Más estable que CardPayment
- Mejor soporte de MercadoPago
- Menos problemas con Secure Fields

## 🆘 Si aún tienes problemas

1. Verifica que las credenciales sean de PRUEBA (TEST-...)
2. Verifica que ambas credenciales sean de la misma aplicación
3. Revisa la consola del navegador (F12) para ver errores específicos
4. Revisa los logs del backend
5. Prueba con otro navegador (Chrome en modo incógnito)
