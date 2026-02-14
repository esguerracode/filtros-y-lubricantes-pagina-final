# Script de sincronización automática para GitHub
param (
    [string]$CommitMessage = "Auto-sync: Catalog updates and UX optimizations"
)

Write-Host "🚀 Iniciando sincronización con GitHub..." -ForegroundColor Cyan

# Eliminar carpetas pesadas antes de agregar
Remove-Item -Path "temp_zip_content", "temp_kits_unzipped", "extracted_images" -Recurse -Force -ErrorAction SilentlyContinue

git add .
git commit -m $CommitMessage
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
