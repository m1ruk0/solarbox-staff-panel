# Скрипт для создания самоподписанного сертификата
# Запускать от администратора!

Write-Host "Creating self-signed certificate for SolarBox..." -ForegroundColor Cyan

# Создаем сертификат
$cert = New-SelfSignedCertificate `
    -Type CodeSigningCert `
    -Subject "CN=SolarBox, O=SolarBox, C=RU" `
    -KeyUsage DigitalSignature `
    -FriendlyName "SolarBox Code Signing" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}") `
    -NotAfter (Get-Date).AddYears(5)

Write-Host "Certificate created: $($cert.Thumbprint)" -ForegroundColor Green

# Экспортируем в PFX
$password = ConvertTo-SecureString -String "solarbox2025" -Force -AsPlainText
$certPath = Join-Path $PSScriptRoot "solarbox-cert.pfx"

Export-PfxCertificate -Cert $cert -FilePath $certPath -Password $password
Write-Host "Certificate exported to: $certPath" -ForegroundColor Green
Write-Host "Password: solarbox2025" -ForegroundColor Yellow

# Добавляем в Trusted Root (чтобы Windows доверял)
Write-Host "`nAdding certificate to Trusted Root..." -ForegroundColor Cyan
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "CurrentUser")
$store.Open("ReadWrite")
$store.Add($cert)
$store.Close()

Write-Host "`nDone! Certificate is ready to use." -ForegroundColor Green
Write-Host "Add this to package.json:" -ForegroundColor Yellow
Write-Host @"
"win": {
  "certificateFile": "solarbox-cert.pfx",
  "certificatePassword": "solarbox2025",
  "verifyUpdateCodeSignature": true
}
"@ -ForegroundColor White
