# Analyze sheet data for enrichment targets
$sheetData = Get-Content "sheet-data.json" -Raw | ConvertFrom-Json

# Skip header row
$header = $sheetData[0]
$rows = $sheetData[1..($sheetData.Count - 1)]

Write-Host "`n=== ENRICHMENT ANALYSIS ===" -ForegroundColor Cyan
Write-Host "Total firms in sheet: $($rows.Count)"

# Find rows needing enrichment
$needsEnrichment = @()

foreach ($row in $rows) {
    $company = $row[0]
    $contactName = if ($row[1]) { $row[1].Trim() } else { "" }
    $title = if ($row[2]) { $row[2].Trim() } else { "" }
    $email = if ($row[3]) { $row[3].Trim().ToLower() } else { "" }
    $website = if ($row[4]) { $row[4].Trim() } else { "" }
    $linkedin = if ($row[5]) { $row[5].Trim() } else { "" }
    $status = if ($row[8]) { $row[8].Trim() } else { "" }
    
    # Skip if already contacted or in progress
    if ($status -eq "Contacted" -or $status -eq "Draft" -or $status -eq "Enriching") {
        continue
    }
    
    # Check if needs enrichment
    $hasNoContact = [string]::IsNullOrWhiteSpace($contactName)
    $hasGenericEmail = $email -match "^(info@|sales@|ir@|contact@|hello@|invest@)"
    $hasNoEmail = [string]::IsNullOrWhiteSpace($email)
    
    if ($hasNoContact -or $hasGenericEmail -or $hasNoEmail) {
        $needsEnrichment += [PSCustomObject]@{
            Company = $company
            ContactName = $contactName
            Title = $title
            Email = $email
            Website = $website
            LinkedIn = $linkedin
            Status = $status
            Issue = if ($hasNoContact) { "No contact" } elseif ($hasGenericEmail) { "Generic email" } else { "No email" }
        }
    }
}

Write-Host "Firms needing enrichment: $($needsEnrichment.Count)`n" -ForegroundColor Yellow

# Group by issue
$noContact = $needsEnrichment | Where-Object { [string]::IsNullOrWhiteSpace($_.ContactName) }
$genericEmail = $needsEnrichment | Where-Object { $_.Email -match "^(info@|sales@|ir@|contact@|hello@|invest@)" }
$noEmail = $needsEnrichment | Where-Object { [string]::IsNullOrWhiteSpace($_.Email) }

Write-Host "Breakdown:"
Write-Host "- No contact name: $($noContact.Count)"
Write-Host "- Generic email: $($genericEmail.Count)"
Write-Host "- No email: $($noEmail.Count)`n"

# Show first 15 targets
Write-Host "First 15 targets for enrichment:`n" -ForegroundColor Green
$needsEnrichment[0..14] | ForEach-Object -Begin { $i = 1 } -Process {
    Write-Host "$i. $($_.Company)" -ForegroundColor White
    Write-Host "   Contact: $(if ($_.ContactName) { $_.ContactName } else { '(empty)' })" -ForegroundColor Gray
    Write-Host "   Email: $(if ($_.Email) { $_.Email } else { '(empty)' })" -ForegroundColor Gray
    Write-Host "   Website: $($_.Website)" -ForegroundColor Gray
    Write-Host "   Status: $($_.Status) | Issue: $($_.Issue)" -ForegroundColor Gray
    Write-Host ""
    $i++
}

# Save to JSON
$needsEnrichment | ConvertTo-Json -Depth 10 | Out-File "enrichment-targets-now.json"
Write-Host "`nSaved $($needsEnrichment.Count) targets to enrichment-targets-now.json" -ForegroundColor Cyan
