# Frontend Admin Configuration

## Configurar el código de administrador en el frontend

### Opción 1: Variable de entorno (Recomendado para desarrollo)

1. Crear archivo `.env` en `frontend/`:

```env
VITE_API_URL=http://localhost:3000
VITE_ADMIN_CODE=tu_codigo_admin_aqui
```

2. Usar en el código:
```javascript
const adminCode = import.meta.env.VITE_ADMIN_CODE;
```

### Opción 2: Almacenamiento local (Recomendado para producción)

Crear un sistema de login simple que guarde el código en localStorage.

## Actualizar Admin.jsx para usar autenticación

### Cambios necesarios:

1. **En `fetchOrders`:**
```javascript
const fetchOrders = async () => {
  try {
    const adminCode = import.meta.env.VITE_ADMIN_CODE || localStorage.getItem('adminCode');
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
      headers: {
        'x-admin-code': adminCode
      }
    });
    
    if (res.status === 401 || res.status === 403) {
      alert('Código de administrador inválido');
      return;
    }
    
    const data = await res.json();
    setOrders(data.orders || data); // Soporta nueva estructura con paginación
    // ...
  }
}
```

2. **En `updateOrderStatus`:**
```javascript
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const adminCode = import.meta.env.VITE_ADMIN_CODE || localStorage.getItem('adminCode');
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "x-admin-code": adminCode
      },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (res.status === 401 || res.status === 403) {
      alert('No tienes permisos para actualizar órdenes');
      return;
    }
    // ...
  }
}
```

## Opción Completa: Sistema de Login Simple

Crear `frontend/src/components/AdminLogin.jsx`:

```javascript
import { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar el código
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        headers: {
          'x-admin-code': code
        }
      });
      
      if (res.ok) {
        localStorage.setItem('adminCode', code);
        onLogin(code);
      } else {
        setError('Código inválido');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="bg-card-light rounded-lg border border-border-light p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Código de Administrador
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 rounded border border-border-light"
              placeholder="Ingresa tu código"
            />
          </div>
          
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-opacity-90"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
```

Actualizar `Admin.jsx`:

```javascript
import { useState, useEffect } from 'react';
import AdminLogin from '../components/AdminLogin';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  
  useEffect(() => {
    // Verificar si hay código guardado
    const savedCode = localStorage.getItem('adminCode');
    if (savedCode) {
      setAdminCode(savedCode);
      setIsAuthenticated(true);
    }
  }, []);
  
  const handleLogin = (code) => {
    setAdminCode(code);
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminCode');
    setIsAuthenticated(false);
    setAdminCode('');
  };
  
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }
  
  // Resto del componente Admin existente...
  // Asegúrate de pasar adminCode a las funciones fetch
}
```

## Configuración rápida para desarrollo

1. Crear `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_ADMIN_CODE=el_codigo_que_generaste_en_backend
```

2. No subir `frontend/.env` a git (ya está en .gitignore)

3. Para producción, NO uses variables de entorno del cliente - implementa el sistema de login.

## Seguridad Importante

⚠️ **NUNCA** pongas el código admin hardcodeado en el código fuente.

⚠️ Las variables de entorno de Vite (`VITE_*`) son **públicas** y se exponen en el bundle final. Solo úsalas en desarrollo.

⚠️ Para producción, implementa el sistema de login que verifica el código contra el backend.

## Testing

1. Intenta acceder sin código - debería mostrar error 401
2. Usa código incorrecto - debería mostrar error 403
3. Usa código correcto - debería funcionar
4. Cierra sesión - el código debería borrarse
