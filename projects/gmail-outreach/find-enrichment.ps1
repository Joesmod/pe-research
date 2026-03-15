$json = Get-Content -Raw sheet-data.json | ConvertFrom-Json
$data = $json.value

Write-Host "Analyzing $($data.Count) rows for enrichment needs...`n"

$needsEnrichment = @()
$genericPatterns = @('info@', 'sales@', 'ir@', 'contact@', 'investor@', 'admin@')

for ($i = 1; $i -lt $data.Count; $i++) {  # Start at 1 to skip header
    $row = $data[$i]
    
    if ($row.Count -lt 5) { continue }
    
    $firmName = $row[0]
    $contactName = $row[2]
    $email = $row[4]
    $status = if ($row.Count -gt 6) { $row[6] } else { "" }
    
    # Skip if firm name is empty or placeholder
    if ([string]::IsNullOrWhiteSpace($firmName) -or $firmName -eq "Jacob Zodikoff" -or $firmName -like "Not*PE*") {
        continue
    }
    
    # Skip if already marked as Enriched
    if ($status -match "Enriched") { continue }
    
    $needsContact = [string]::IsNullOrWhiteSpace($contactName) -or $contactName -eq "Jacob Zodikoff"
    $needsEmail = [string]::IsNullOrWhiteSpace($email)
    
    # Check for generic/placeholder emails
    if (-not $needsEmail -and $email) {
        foreach ($pattern in $genericPatterns) {
            if ($email.ToLower().StartsWith($pattern)) {
                $needsEmail = $true
                break
            }
        }
        # Also check for placeholder patterns
        if ($email -match "email_not_unlocked|@domain\.com") {
            $needsEmail = $true
        }
    }
    
    if ($needsContact -or $needsEmail) {
        $needsEnrichment += [PSCustomObject]@{
            RowIndex = $i
            Firm = $firmName
            Website = $row[1]
            CurrentContact = if ($contactName) { $contactName } else { "(empty)" }
            CurrentTitle = if ($row[3]) { $row[3] } else { "(empty)" }
            CurrentEmail = if ($email) { $email } else { "(empty)" }
            NeedsContact = $needsContact
            NeedsEmail = $needsEmail
            Priority = if ($needsContact -and $needsEmail) { "HIGH" } elseif ($needsEmail) { "MEDIUM" } else { "LOW" }
        }
    }
}

Write-Host "Found $($needsEnrichment.Count) firms needing enrichment"
Write-Host "`nTop 15 highest priority (missing both contact and email):`n"

$highPriority = $needsEnrichment | Where-Object { $_.Priority -eq "HIGH" } | Select-Object -First 15

$highPriority | ForEach-Object {
    Write-Host "[$($_.RowIndex)] $($_.Firm)"
    Write-Host "   Website: $($_.Website)"
    Write-Host "   Current Contact: $($_.CurrentContact)"
    Write-Host "   Current Email: $($_.CurrentEmail)"
    Write-Host ""
}

# Save to JSON for further processing
$needsEnrichment | ConvertTo-Json -Depth 10 | Set-Content "needs-enrichment.json"
Write-Host "`nSaved $($needsEnrichment.Count) firms to needs-enrichment.json"
Write-Host "High priority: $($needsEnrichment | Where-Object { $_.Priority -eq 'HIGH' } | Measure-Object | Select-Object -ExpandProperty Count)"
Write-Host "Medium priority: $($needsEnrichment | Where-Object { $_.Priority -eq 'MEDIUM' } | Measure-Object | Select-Object -ExpandProperty Count)"
Write-Host "Low priority: $($needsEnrichment | Where-Object { $_.Priority -eq 'LOW' } | Measure-Object | Select-Object -ExpandProperty Count)"
