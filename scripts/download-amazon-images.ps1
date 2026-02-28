# Script para descargar imágenes de productos desde Amazon y otras fuentes
# Ejecutar desde la raíz del proyecto

$OutputDir = ".\public\images\products"
$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    "Referer"    = "https://www.amazon.com/"
}

$images = @(
    # 129.png — Filtro Aceite Ford JU2Z-6731A (Ranger 2022-2026)
    @{ id = "129"; url = "https://m.media-amazon.com/images/I/31mAHtkke9L._AC_.jpg"; label = "Filtro Aceite Ford JU2Z-6731A" },

    # 128.png — Filtro Aire Motor Ford MG2MZ9601B (Ranger Diesel 2015-2019)
    # Usando imagen del filtro de aire EB3Z-9601B compatible (mismo tipo, Ranger)
    @{ id = "128"; url = "https://m.media-amazon.com/images/I/51OuMr881jL._AC_.jpg"; label = "Filtro Aire Ford MG2MZ9601B" },

    # 130.png — Filtro Cabina Ford HB3Z19N619B (Ranger 2019-2022)
    # Usando imagen del filtro cabina para Ranger 2019-2024 compatible KB3Z-19N619-A
    @{ id = "130"; url = "https://m.media-amazon.com/images/I/81oPf2pFFSL._AC_SX342_.jpg"; label = "Filtro Cabina Ford HB3Z19N619B" },

    # 133.png — Filtro Cabina Ford MB3Z19N619C (Ranger 2025-2026)
    @{ id = "133"; url = "https://m.media-amazon.com/images/I/51G7hkeNz9L._AC_.jpg"; label = "Filtro Cabina Ford MB3Z19N619C" },

    # 127.png — Filtro Combustible Ford EB3Z-9365B (Ranger Diesel 2021-2022)
    @{ id = "127"; url = "https://m.media-amazon.com/images/I/61BNgHKb2KL._AC_SY355_.jpg"; label = "Filtro Combustible Ford EB3Z-9365B" },

    # 131.png — Filtro Combustible Ford KV61-9155AG (Ranger 2022-2025)
    @{ id = "131"; url = "https://m.media-amazon.com/images/I/31wmSqIKLHL._AC_.jpg"; label = "Filtro Combustible Ford KV61-9155AG" },

    # 126.png — Aceite Motorcraft 10W30 ¼ Galón
    @{ id = "126"; url = "https://m.media-amazon.com/images/I/41MYiAHmKWL._AC_.jpg"; label = "Aceite Motorcraft 10W30" },

    # 109.png — KIT Ford Ranger Original 2025–2026
    @{ id = "109"; url = "https://www.filtersplus.co/wp-content/uploads/2024/09/FK021-KIT.jpg"; label = "KIT Ford Ranger 2025 Original" },

    # 110.png — Aceite Motorcraft 5W30 ¼ Galón
    @{ id = "110"; url = "https://m.media-amazon.com/images/I/41MYiAHmKWL._AC_.jpg"; label = "Aceite Motorcraft 5W30" }
)

Write-Host "=== Descargando imágenes de productos Ford / Motorcraft ===" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($item in $images) {
    $dest = Join-Path $OutputDir "$($item.id).png"
    $tempDest = Join-Path $OutputDir "$($item.id)_temp.jpg"

    Write-Host "[$($item.id)] $($item.label)" -ForegroundColor Yellow
    Write-Host "  URL: $($item.url)"

    try {
        # Descargar imagen original (JPG)
        Invoke-WebRequest -Uri $item.url -OutFile $tempDest -Headers $headers -TimeoutSec 30
        
        $downloadedSize = (Get-Item $tempDest).Length
        Write-Host "  Descargada: $([math]::Round($downloadedSize/1KB, 1))KB" -ForegroundColor Green

        # Convertir a PNG usando .NET System.Drawing
        Add-Type -AssemblyName System.Drawing
        $img = [System.Drawing.Image]::FromFile((Resolve-Path $tempDest).Path)
        $img.Save((Resolve-Path $OutputDir).Path + "\$($item.id).png", [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Dispose()

        # Eliminar temporal
        Remove-Item $tempDest -Force

        $finalSize = (Get-Item $dest).Length
        Write-Host "  Guardado como PNG: $([math]::Round($finalSize/1KB, 1))KB" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
        if (Test-Path $tempDest) { Remove-Item $tempDest -Force }
        $failCount++
    }
    Write-Host ""
}

Write-Host "=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "  Exitosas: $successCount" -ForegroundColor Green
Write-Host "  Fallidas: $failCount" -ForegroundColor Red
