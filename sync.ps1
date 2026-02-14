# Script de sincronización automática para GitHub
param (
    [string]$CommitMessage = "Auto-sync: Catalog updates and UX optimizations"
)

Write-Host "🚀 Iniciando sincronización con GitHub..." -ForegroundColor Cyan

# Lista de carpetas pesadas para eliminar antes de subir
$HeavyPaths = @("temp_zip_content", "temp_kits_unzipped", "extracted_images", "node_modules", "dist", ".next")

foreach ($Path in $HeavyPaths) {
    if (Test-Path $Path) {
        Write-Host "🧹 Limpiando: $Path"
        Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Configuración de Git para evitar problemas de caracteres
git config core.quotepath false

# Agregar todos los cambios
Write-Host "📦 Preparando archivos..."
git add .

# Hacer commit solo si hay cambios
$Status = git status --porcelain
if ($Status) {
    Write-Host "📝 Realizando commit: $CommitMessage"
    git commit -m $CommitMessage
}
else {
    Write-Host "⚪ No hay cambios para commitear."
}

# Empujar a la rama main
Write-Host "⬆️ Subiendo cambios a GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sincronización completada exitosamente." -ForegroundColor Green
}
else {
    Write-Host "❌ Error durante la sincronización. Verifica tu conexión o credenciales." -ForegroundColor Red
}
# Script de sincronización automática para GitHub
# Uso: .\sync.ps1 "Mensaje del commit"

param (
    [string]$CommitMessage = "Auto-sync: Catalog updates and UX optimizations"
)

Write-Host "🚀 Iniciando sincronización con GitHub..." -ForegroundColor Cyan

# Agregar todos los cambios
git add .

# Hacer commit
git commit -m $CommitMessage

# Empujar a la rama main
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sincronización completada exitosamente." -ForegroundColor Green
}
else {
    Write-Host "❌ Error durante la sincronización. Verifica tu conexión o credenciales." -ForegroundColor Red
}
