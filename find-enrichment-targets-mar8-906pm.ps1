$data = Get-Content "C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach\sheet-data.json" -Raw | ConvertFrom-Json

$targets = @()
for ($i = 1; $i -lt $data.Count; $i++) {
    $row = $data[$i]
    $company = if ($row.Count -gt 0) { $row[0] } else { "" }
    $contact = if ($row.Count -gt 2) { $row[2] } else { "" }
    $email = if ($row.Count -gt 4) { $row[4] } else { "" }
    $website = if ($row.Count -gt 5) { $row[5] } else { "" }
    $status = if ($row.Count -gt 9) { $row[9] } else { "" }
    
    # Skip if dead/duplicate or no company name
    if ($status -match "(dead|duplicate)" -or !$company) { continue }
    
    # Check if needs enrichment
    $needsEnrich = $false
    if (!$contact -or $contact -eq "") { $needsEnrich = $true }
    if (!$email -or $email -eq "" -or $email -match "^(info@|sales@|ir@|contact@|hello@)") { $needsEnrich = $true }
    
    if ($needsEnrich) {
        $targets += [PSCustomObject]@{
            Row = $i + 1
            Company = $company
            Contact = $contact
            Email = $email
            Website = $website
            Status = $status
        }
    }
}

$targets | Select-Object -First 20 | Format-Table -AutoSize
Write-Host "`nTotal firms needing enrichment: $($targets.Count)"
