# ============================================================
# Script: download-images.ps1
# Descarga imágenes oficiales de Premium Filters y las guarda
# en public/images/products/ con el nombre correcto (ID.png)
# ============================================================

$destDir = "public\images\products"

# Tabla: destino => URL fuente
$images = @{
  # --- FILTROS DE ACEITE ---
  "113.png" = "https://premiumfilters.store/cdn/shop/files/OLP-067_8677d002-330c-422d-a1f9-f61adddbeb57.jpg?v=1757345071"
  "120.png" = "https://premiumfilters.store/cdn/shop/files/OLP-019_658aedb0-a2b9-47f7-ad38-df928220b6e2.jpg?v=1757530715&width=1000"
  "122.png" = "https://premiumfilters.store/cdn/shop/files/OLP-077.jpg?v=1736966200&width=700"
  "124.png" = "https://premiumfilters.store/cdn/shop/files/OLP-115.jpg?v=1712104846&width=700"
  # 129.png = Ford JU2Z-6731A → generado con IA (se copia al final)

  # --- FILTROS DE AIRE MOTOR ---
  "111.png" = "https://premiumfilters.store/cdn/shop/files/AIP-977.jpg?v=1712103135&width=1000"
  "115.png" = "https://premiumfilters.store/cdn/shop/files/AIP-651.jpg?v=1736966741&width=1000"
  "118.png" = "https://premiumfilters.store/cdn/shop/files/AIP-961.jpg?v=1712099576&width=1000"
  # 128.png = Ford MG2MZ9601B → generado con IA
  # 132.png = Ford MB3Z-9601C → generado con IA

  # --- FILTROS DE AIRE ACONDICIONADO ---
  "112.png" = "https://premiumfilters.store/cdn/shop/files/ACP-138.jpg?v=1736967116&width=700"
  # 116.png = ACP 071 Toyota Vigo
  # 119.png = ACP 123 Nissan NP300
  # 130.png = Ford HB3Z19N619B → generado con IA
  # 133.png = Ford MB3Z19N619C → generado con IA

  # --- FILTROS DE COMBUSTIBLE ---
  "114.png" = "https://premiumfilters.store/cdn/shop/files/FLP-476.jpg?v=1712105943&width=700"
  "123.png" = "https://premiumfilters.store/cdn/shop/files/FLP-471.jpg?v=1736966308&width=360"
  # 117.png = FLP 355 Toyota Vigo
  # 125.png = FLP 509 Ford Ranger nacional
  # 127.png = Ford EB3Z-9365B → generado con IA
  # 131.png = Ford KV61-9155AG → generado con IA
}

Write-Host "🚀 Descargando imagenes de Premium Filters..." -ForegroundColor Cyan

foreach ($filename in $images.Keys) {
  $url = $images[$filename]
  $dest = Join-Path $destDir $filename
  
  Write-Host "⬇️  $filename ← $url" -ForegroundColor Yellow
  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -TimeoutSec 30
    $size = [math]::Round((Get-Item $dest).Length / 1KB, 1)
    Write-Host "   ✅ Guardado: $filename ($size KB)" -ForegroundColor Green
  } catch {
    Write-Host "   ❌ Error descargando $filename : $_" -ForegroundColor Red
  }
}

# Buscar imágenes adicionales para ACP 071 (116), ACP 123 (119)
Write-Host ""
Write-Host "✅ Descarga completa" -ForegroundColor Cyan
Write-Host "Archivos en $destDir :"
Get-ChildItem $destDir -Filter "*.png" | Where-Object { $_.Name -match '^\d+\.png$' } | Sort-Object Name | Select-Object Name, @{Name="KB";Expression={[math]::Round($_.Length/1KB,1)}}
