# Get the local IP address (preferring Wi-Fi or Ethernet, excluding virtual adapters)
$ip = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.InterfaceAlias -notmatch "vEthernet" -and 
    $_.InterfaceAlias -notmatch "Loopback" -and 
    $_.InterfaceAlias -notmatch "VMware" -and 
    $_.IPAddress -notmatch "^169\.254" -and 
    $_.IPAddress -notmatch "^172\.(1[6-9]|2[0-9]|3[0-1])" # Exclude Docker default ranges if possible, though 172.19 is tricky as user IS on 172.19
} | Sort-Object InterfaceMetric | Select-Object -First 1 -ExpandProperty IPAddress

# Fallback if the above logic is too strict (User's IP was 172.19.21.60 which looks like a private range often used by Docker too, but it's their WiFi)
if (-not $ip) {
    # Try simpler match for Wi-Fi
    $ip = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -match "Wi-Fi" } | Select-Object -First 1 -ExpandProperty IPAddress
}

if (-not $ip) {
    Write-Host "Could not automatically detect IP. Defaulting to 127.0.0.1" -ForegroundColor Yellow
    $ip = "127.0.0.1"
}

Write-Host "🚀 Detected Host IP: $ip" -ForegroundColor Green
Write-Host "Setting HOST_IP environment variable..."

# Set the environment variable for the current session
$env:HOST_IP = $ip

# Run Docker Compose
Write-Host "Starting Docker Compose..." -ForegroundColor Cyan
docker-compose up -d --build

Write-Host "`n✅ Services started!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:8081"
Write-Host "🔧 Backend:  http://localhost:5000"
Write-Host "🔗 QR Codes will point to: http://$ip:5000"
