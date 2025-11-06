# Script de Setup para Etronix Store
# Ejecutar con: .\setup.ps1

Write-Host "🚀 Iniciando configuración de Etronix Store..." -ForegroundColor Cyan

# Verificar si existe .env en backend
if (Test-Path "backend\.env") {
    Write-Host "✅ Archivo .env encontrado en backend" -ForegroundColor Green
} else {
    Write-Host "⚠️  Archivo .env NO encontrado. Copiando .env.example..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "📝 Por favor, edita backend\.env y configura tus credenciales" -ForegroundColor Yellow
    Write-Host "   - MONGODB_URI" -ForegroundColor White
    Write-Host "   - MP_ACCESS_TOKEN" -ForegroundColor White
    Write-Host "   - ADMIN_CODE (genera uno aleatorio)" -ForegroundColor White
}

# Verificar directorio de logs
if (!(Test-Path "backend\logs")) {
    Write-Host "📁 Creando directorio de logs..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "backend\logs" -Force | Out-Null
    Write-Host "✅ Directorio de logs creado" -ForegroundColor Green
}

# Generar ADMIN_CODE si no existe
Write-Host "`n🔐 Generando código de administrador seguro..." -ForegroundColor Cyan
$adminCode = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
Write-Host "   Código sugerido: $adminCode" -ForegroundColor Yellow
Write-Host "   Cópialo y pégalo en backend\.env como ADMIN_CODE" -ForegroundColor White

# Verificar instalación de dependencias
Write-Host "`n📦 Verificando dependencias..." -ForegroundColor Cyan

if (!(Test-Path "backend\node_modules")) {
    Write-Host "⚠️  Dependencias del backend no instaladas" -ForegroundColor Yellow
    $installBackend = Read-Host "¿Instalar ahora? (s/n)"
    if ($installBackend -eq "s") {
        Write-Host "   Instalando dependencias del backend..." -ForegroundColor Cyan
        Set-Location backend
        npm install
        Set-Location ..
        Write-Host "✅ Dependencias del backend instaladas" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Dependencias del backend instaladas" -ForegroundColor Green
}

if (!(Test-Path "frontend\node_modules")) {
    Write-Host "⚠️  Dependencias del frontend no instaladas" -ForegroundColor Yellow
    $installFrontend = Read-Host "¿Instalar ahora? (s/n)"
    if ($installFrontend -eq "s") {
        Write-Host "   Instalando dependencias del frontend..." -ForegroundColor Cyan
        Set-Location frontend
        npm install
        Set-Location ..
        Write-Host "✅ Dependencias del frontend instaladas" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Dependencias del frontend instaladas" -ForegroundColor Green
}

Write-Host "`n✨ Configuración completada!" -ForegroundColor Green
Write-Host "`n📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Configura backend\.env con tus credenciales" -ForegroundColor White
Write-Host "   2. Ejecuta 'npm run dev' en la carpeta backend" -ForegroundColor White
Write-Host "   3. Ejecuta 'npm run dev' en la carpeta frontend" -ForegroundColor White
Write-Host "`n📖 Lee MEJORAS_NOVIEMBRE_2025.md para más información" -ForegroundColor Cyan
