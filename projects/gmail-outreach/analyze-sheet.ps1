$data = Get-Content -Raw sheet-data.json | ConvertFrom-Json

Write-Host "Total rows: $($data.Count)"
Write-Host "`nAnalyzing for enrichment needs...`n"

$needsEnrichment = @()
$genericEmails = @('info@', 'sales@', 'ir@', 'contact@', 'investor', 'admin@')

for ($i = 0; $i -lt $data.Count; $i++) {
    $row = $data[$i]
    
    # Skip header row and empty rows
    if ($i -eq 0 -or $row.Count -lt 5) { continue }
    
    $firmName = $row[0]
    $contactName = $row[2]
    $email = $row[4]
    $status = if ($row.Count -gt 6) { $row[6] } else { "" }
    
    # Skip if already enriched
    if ($status -match "Enriched") { continue }
    
    # Check if needs enrichment
    $needsContact = [string]::IsNullOrWhiteSpace($contactName)
    $needsEmail = [string]::IsNullOrWhiteSpace($email)
    
    # Check for generic emails
    if (-not $needsEmail) {
        foreach ($generic in $genericEmails) {
            if ($email -like "$generic*") {
                $needsEmail = $true
                break
            }
        }
    }
    
    if ($needsContact -or $needsEmail) {
        $needsEnrichment += [PSCustomObject]@{
            Index = $i
            Firm = $firmName
            CurrentContact = $contactName
            CurrentEmail = $email
            NeedsContact = $needsContact
            NeedsEmail = $needsEmail
        }
    }
}

Write-Host "Found $($needsEnrichment.Count) firms needing enrichment`n"
Write-Host "First 15 firms to enrich:`n"

$needsEnrichment | Select-Object -First 15 | ForEach-Object {
    Write-Host "[$($_.Index)] $($_.Firm)"
    if ($_.NeedsContact) { Write-Host "  - Missing contact name" }
    if ($_.NeedsEmail) { Write-Host "  - Missing or generic email: $($_.CurrentEmail)" }
    Write-Host ""
}

# Save full list to file
$needsEnrichment | ConvertTo-Json -Depth 10 | Set-Content "needs-enrichment.json"
Write-Host "`nFull list saved to needs-enrichment.json"
