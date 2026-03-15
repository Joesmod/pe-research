$content = Get-Content "latest-sheet-snapshot.txt" -Raw -Encoding UTF8
# Remove BOM if present
if ($content[0] -eq [char]0xFEFF) {
    $content = $content.Substring(1)
}

$data = $content | ConvertFrom-Json

# Skip header row
$rows = $data | Select-Object -Skip 1

Write-Host "Total rows: $($rows.Count)"

# Find leads needing enrichment
$needsEnrichment = @()
foreach ($row in $rows) {
    $company = $row[0]
    $notebookLM = $row[1]
    $contactName = $row[2]
    $title = $row[3]
    $email = $row[4]
    $website = $row[5]
    $linkedin = $row[6]
    $sector = $row[7]
    $portfolio = $row[8]
    $status = $row[9]
    
    # Skip dead/closed firms
    if ($status -match "Dead|Closed") {
        continue
    }
    
    # Check if needs enrichment
    $noContactName = [string]::IsNullOrWhiteSpace($contactName)
    $genericEmail = [string]::IsNullOrWhiteSpace($email) -or 
                    $email -match "^(info|sales|ir|contact|invest)@"
    
    if ($noContactName -or $genericEmail) {
        $needsEnrichment += @{
            Company = $company
            ContactName = $contactName
            Email = $email
            Website = $website
            LinkedIn = $linkedin
            Reason = if ($noContactName) { "No contact name" } else { "Generic/missing email" }
        }
    }
}

Write-Host "Leads needing enrichment: $($needsEnrichment.Count)`n"

# Show top 15
Write-Host "Top 15 leads needing enrichment:`n"
for ($i = 0; $i -lt [Math]::Min(15, $needsEnrichment.Count); $i++) {
    $lead = $needsEnrichment[$i]
    Write-Host "$($i + 1). $($lead.Company)"
    Write-Host "   Contact: $(if ($lead.ContactName) { $lead.ContactName } else { '(EMPTY)' })"
    Write-Host "   Email: $(if ($lead.Email) { $lead.Email } else { '(EMPTY)' })"
    Write-Host "   Website: $($lead.Website)"
    Write-Host "   Reason: $($lead.Reason)`n"
}

# Save to JSON for enrichment
$needsEnrichment | Select-Object -First 15 | ConvertTo-Json -Depth 10 | Out-File "enrichment-targets-hourly.json" -Encoding UTF8
Write-Host "Saved top 15 targets to enrichment-targets-hourly.json"
