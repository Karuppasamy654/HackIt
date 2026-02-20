# Add Node.js to PATH for this session so npm and node work
$nodePath = "C:\Program Files\nodejs"
$env:PATH = "$nodePath;$env:PATH"

Set-Location $PSScriptRoot

Write-Host "Installing dependencies..." -ForegroundColor Cyan
& npm install
if ($LASTEXITCODE -ne 0) {
  Write-Host "npm install failed." -ForegroundColor Red
  exit 1
}

Write-Host "`nStarting the app at http://localhost:3000" -ForegroundColor Green
& npm run dev
