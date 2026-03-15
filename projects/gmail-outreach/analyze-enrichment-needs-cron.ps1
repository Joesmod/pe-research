$data = Get-Content "crm-data.json" -Raw | ConvertFrom-Json
$sheet = $data.sheet1

$needsEnrichment = @()

for ($i = 1; $i -lt $sheet.Count; $i++) {
    $row = $sheet[$i]
    $company = $row[0]
    $contact = $row[1]
    $title = $row[2]
    $email = $row[3]
    $status = $row[8]
    
    # Skip if status is Dead/Contacted/Sent
    if ($status -match "(Dead|Contacted|Sent)") { continue }
    
    # Check if needs enrichment
    $needsContact = [string]::IsNullOrWhiteSpace($contact) -or $contact -eq ""
    $needsEmail = [string]::IsNullOrWhiteSpace($email) -or $email -eq "" -or $email -match "^(info|sales|ir|contact|admin)@"
    
    if ($needsContact -or $needsEmail) {
        $needsEnrichment += @{
            Company = $company
            Contact = $contact
            Title = $title
            Email = $email
            Status = $status
            NeedsContact = $needsContact
            NeedsEmail = $needsEmail
        }
    }
}

Write-Host "Found $($needsEnrichment.Count) leads needing enrichment"
$needsEnrichment | Select-Object -First 15 | Format-Table -AutoSize
