$json = Get-Content "current-sheet-data.json" -Raw | ConvertFrom-Json

# Skip header row (index 0)
$leads = $json[1..($json.Count-1)]

# Filter for leads needing enrichment:
# - Not dead leads
# - Empty contact name OR generic email
$needEnrichment = $leads | Where-Object {
    $company = $_[0]
    $contact = $_[2]
    $email = $_[4]
    $status = $_[9]
    $notes = $_[11]
    
    # Exclude dead leads
    $isDead = $status -match "Dead" -or $notes -match "Dead"
    
    # Need enrichment if empty contact or generic email
    $needsContact = [string]::IsNullOrWhiteSpace($contact)
    $hasGenericEmail = $email -match "^(info@|sales@|ir@|contact@|hello@|invest@)"
    
    -not $isDead -and ($needsContact -or $hasGenericEmail)
}

Write-Host "=== ENRICHMENT ANALYSIS ===" -ForegroundColor Cyan
Write-Host "Total active leads needing enrichment: $($needEnrichment.Count)" -ForegroundColor Yellow
Write-Host ""

# Show first 15 needing enrichment
Write-Host "=== FIRST 15 TARGETS ===" -ForegroundColor Green
$targets = $needEnrichment | Select-Object -First 15
foreach ($lead in $targets) {
    Write-Host ""
    Write-Host "Company: $($lead[0])" -ForegroundColor White
    Write-Host "Website: $($lead[5])"
    Write-Host "Current Contact: $($lead[2])"
    Write-Host "Current Email: $($lead[4])"
    Write-Host "Status: $($lead[9])"
    Write-Host "Notes: $($lead[11])" -ForegroundColor Gray
}
