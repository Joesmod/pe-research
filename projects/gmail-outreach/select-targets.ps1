$data = Get-Content "enrichment-targets.json" -Raw | ConvertFrom-Json

$goodTargets = $data | Where-Object { 
    $_.Status -eq "Researched" -and 
    $_.Company -notmatch "(Fund Impact|Tixel|Backstroke|Dorm Room|FlexFunds|Global Impact|SkyBridge)" -and
    $_.Index -lt 500
} | Select-Object -First 15

Write-Host "=== SELECTED TARGETS FOR ENRICHMENT ==="
$goodTargets | Format-Table Index, Company, Contact, Email -AutoSize

$goodTargets | ConvertTo-Json -Depth 10 | Out-File "selected-targets.json" -Encoding UTF8
