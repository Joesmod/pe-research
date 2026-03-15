$data = Get-Content "crm-data.json" -Raw | ConvertFrom-Json
$sheet = $data.sheet1

$needsEnrichment = @()

for ($i = 1; $i -lt $sheet.Count; $i++) {
    $row = $sheet[$i]
    $company = $row[0]
    $contact = $row[1]
    $title = $row[2]
    $email = $row[3]
    $website = $row[4]
    $linkedin = $row[5]
    $status = $row[8]
    
    # Skip if status is Dead/Contacted/Sent/DUPLICATE
    if ($status -match "(Dead|Contacted|Sent|DUPLICATE)") { continue }
    
    # Check if needs enrichment - has contact name but no direct email
    $hasContact = -not ([string]::IsNullOrWhiteSpace($contact)) -and $contact -ne ""
    $needsEmail = [string]::IsNullOrWhiteSpace($email) -or $email -eq "" -or $email -match "^(info|sales|ir|contact|admin)@"
    
    if ($hasContact -and $needsEmail) {
        $needsEnrichment += [PSCustomObject]@{
            RowIndex = $i
            Company = $company
            Contact = $contact
            Title = $title
            Email = $email
            Website = $website
            LinkedIn = $linkedin
            Status = $status
        }
    }
}

Write-Host "Found $($needsEnrichment.Count) leads with contacts needing email enrichment"
Write-Host ""
Write-Host "Selecting top 15 targets for enrichment:"
Write-Host ""

$targets = $needsEnrichment | Where-Object { 
    $_.Status -notmatch "Researched - No Email"
} | Select-Object -First 15

$targets | ForEach-Object {
    Write-Host "Company: $($_.Company)"
    Write-Host "Contact: $($_.Contact) - $($_.Title)"
    Write-Host "Website: $($_.Website)"
    Write-Host "LinkedIn: $($_.LinkedIn)"
    Write-Host "Current Status: $($_.Status)"
    Write-Host "---"
}

$targets | ConvertTo-Json -Depth 3 | Out-File "enrichment-targets-cron-march9-1206pm.json"
Write-Host "Saved targets to enrichment-targets-cron-march9-1206pm.json"
