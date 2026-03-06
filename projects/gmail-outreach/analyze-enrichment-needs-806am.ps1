$data = Get-Content 'sheet-data-march5-5am.json' -Raw | ConvertFrom-Json
$header = $data[0]
$rows = $data[1..($data.Length-1)]

$needsEnrichment = @()

foreach ($row in $rows) {
    if ($row.Count -gt 4) {
        $company = $row[0]
        $contact = $row[2]
        $email = $row[4]
        $website = $row[5]
        $status = if ($row.Count -gt 9) { $row[9] } else { "" }
        
        # Skip if empty company or already marked as certain statuses
        if ([string]::IsNullOrWhiteSpace($company) -or $status -eq "Dead" -or $status -eq "Sent") {
            continue
        }
        
        # Check if needs enrichment: empty contact OR generic email
        $hasEmptyContact = [string]::IsNullOrWhiteSpace($contact)
        $hasGenericEmail = $email -match '^(info@|sales@|ir@|contact@|investor)'
        
        if ($hasEmptyContact -or $hasGenericEmail) {
            $needsEnrichment += [PSCustomObject]@{
                Company = $company
                Contact = $contact
                Email = $email
                Website = $website
                Status = $status
            }
        }
    }
}

Write-Output "Total firms needing enrichment: $($needsEnrichment.Count)"
Write-Output ""
Write-Output "First 25 firms:"
$needsEnrichment | Select-Object -First 25 | Format-Table -AutoSize

# Save to JSON
$needsEnrichment | Select-Object -First 25 | ConvertTo-Json | Out-File 'enrichment-targets-march5-806am.json'
