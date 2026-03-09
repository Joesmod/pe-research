# PE Research & Enrichment Script
# Runs the sheet reading and enrichment process

$ErrorActionPreference = "Stop"

# Try to find node
$nodePaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\node\node.exe",
    "$env:APPDATA\npm\node.exe"
)

$nodeExe = $null
foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $nodeExe = $path
        break
    }
}

if (-not $nodeExe) {
    Write-Error "Node.js not found in expected locations"
    exit 1
}

Write-Host "Using Node.js: $nodeExe"
Write-Host "Reading Google Sheet..."

& $nodeExe read-current-sheet.js
