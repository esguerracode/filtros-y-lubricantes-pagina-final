$OutputDir = ".\public\images\products"
$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}

$images = @(
    @{ id = "112"; url = "https://m.media-amazon.com/images/I/71s8pGz9r3L._AC_SL1500_.jpg"; label = "ACP 138" },
    @{ id = "116"; url = "https://m.media-amazon.com/images/I/71Oa+D2F7FL._AC_SL1500_.jpg"; label = "ACP 071" },
    @{ id = "119"; url = "https://m.media-amazon.com/images/I/81xU+c1G9cL._AC_SL1500_.jpg"; label = "ACP 123" },
    @{ id = "132"; url = "https://m.media-amazon.com/images/I/81y7W2FhC5L._AC_SL1500_.jpg"; label = "MB3Z-9601C Air" },
    @{ id = "114"; url = "https://m.media-amazon.com/images/I/61jD9sRYv4L._AC_SL1500_.jpg"; label = "FLP 476" },
    @{ id = "117"; url = "https://m.media-amazon.com/images/I/61MvU-SMyUL._AC_SL1500_.jpg"; label = "FLP 355" },
    @{ id = "123"; url = "https://m.media-amazon.com/images/I/51wZ-Q7Z3pL._AC_SL1500_.jpg"; label = "FLP 471" },
    @{ id = "125"; url = "https://m.media-amazon.com/images/I/71Yx-yK2S5L._AC_SL1500_.jpg"; label = "FLP 509" },
    @{ id = "124"; url = "https://m.media-amazon.com/images/I/71J1v0A-lML._AC_SL1500_.jpg"; label = "OLP 115" }
)

Write-Host "=== Replacing watermarked images with clean ones from Amazon ==="

foreach ($item in $images) {
    $dest = Join-Path $OutputDir "$($item.id).png"
    $tempDest = Join-Path $OutputDir "$($item.id)_temp.jpg"
    
    Write-Host "Downloading $($item.label)..."
    try {
        Invoke-WebRequest -Uri $item.url -OutFile $tempDest -Headers $headers -TimeoutSec 30
        Add-Type -AssemblyName System.Drawing
        $img = [System.Drawing.Image]::FromFile((Resolve-Path $tempDest).Path)
        $img.Save((Resolve-Path $OutputDir).Path + "\$($item.id).png", [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Dispose()
        Remove-Item $tempDest -Force
        Write-Host "  -> Done! Saved as $($item.id).png" -ForegroundColor Green
    }
    catch {
        Write-Host "  -> Failed: $_" -ForegroundColor Red
    }
}
