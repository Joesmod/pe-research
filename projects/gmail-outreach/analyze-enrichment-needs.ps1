$data = Get-Content "sheet-data.json" -Raw | ConvertFrom-Json

$needsEnrichment = @()

for ($i = 1; $i -lt $data.Count; $i++) {
    $row = $data[$i]
    $company = $row[0]
    $contact = $row[1]
    $title = $row[2]
    $email = $row[3]
    $status = $row[8]
    
    $needsContact = [string]::IsNullOrWhiteSpace($contact) -or $contact -eq ""
    $hasGenericEmail = $email -match "^(info|sales|ir|contact|admin|hello)@"
    $emptyEmail = [string]::IsNullOrWhiteSpace($email) -or $email -eq ""
    
    if (($needsContact -or $hasGenericEmail -or $emptyEmail) -and $status -ne "Dead Lead") {
        $needsEnrichment += [PSCustomObject]@{
            Index = $i
            Company = $company
            Contact = $contact
            Title = $title
            Email = $email
            Status = $status
            Reason = if ($needsContact) { "NoContact" } elseif ($emptyEmail) { "NoEmail" } else { "GenericEmail" }
        }
    }
}

Write-Host "=== LEADS NEEDING ENRICHMENT ==="
Write-Host "Total: $($needsEnrichment.Count)"
Write-Host ""

$needsEnrichment | Select-Object -First 20 | Format-Table Index, Company, Contact, Email, Reason -AutoSize

Write-Host "`nSaving to enrichment-targets.json..."
$needsEnrichment | ConvertTo-Json -Depth 10 | Out-File "enrichment-targets.json" -Encoding UTF8
