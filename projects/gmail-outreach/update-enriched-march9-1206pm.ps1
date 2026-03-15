# Update CRM with enriched contact emails - March 9, 2026 12:06 PM
$data = Get-Content "crm-data.json" -Raw | ConvertFrom-Json
$sheet = $data.sheet1

# Define enrichment updates
$updates = @(
    @{ Company = "Regal Healthcare Capital Partners"; Contact = "Jon Santemma"; Email = "jsantemma@regalhcp.com"; Source = "ContactOut"; Status = "Enriched" },
    @{ Company = "Regal Healthcare Capital Partners"; Contact = "Terry Wang"; Email = "twang@regalhcp.com"; Source = "ContactOut"; Status = "Enriched" },
    @{ Company = "SDC Capital Partners"; Contact = "Doug Kaden"; Email = "dkaden@sdccapitalpartners.com"; Source = "RocketReach (pattern)"; Status = "Enriched" },
    @{ Company = "Rockbridge Growth Equity, LLC"; Contact = "Spencer Hughes"; Email = "shughes@rbequity.com"; Source = "ContactOut (pattern)"; Status = "Enriched" },
    @{ Company = "Aeris Partners"; Contact = "David Joncas"; Email = "dwj@aerispartners.com"; Source = "ContactOut"; Status = "Enriched" },
    @{ Company = "Alvarez & Marsal Capital"; Contact = "Jack McCarthy"; Email = "jmccarthy@a-mcapital.com"; Source = "RocketReach (pattern)"; Status = "Enriched" },
    @{ Company = "Blue Star Innovation Partners"; Contact = "Rob Wechsler"; Email = "rwechsler@bluestarinnovationpartners.com"; Source = "ZoomInfo (pattern)"; Status = "Enriched" },
    @{ Company = "Casa Verde Capital"; Contact = "Karan Wadhera"; Email = "karan@casaverdecapital.com"; Source = "ContactOut"; Status = "Enriched" },
    @{ Company = "Cornell Capital"; Contact = "Henry Cornell"; Email = "hcornell@cornellcapllc.com"; Source = "RocketReach (pattern)"; Status = "Enriched" }
)

$updateCount = 0

Write-Host "Updating CRM data with enriched emails..."
Write-Host ""

for ($i = 1; $i -lt $sheet.Count; $i++) {
    $row = $sheet[$i]
    $company = $row[0]
    $contact = $row[1]
    
    foreach ($update in $updates) {
        if ($company -eq $update.Company -and $contact -eq $update.Contact) {
            # Update email (column 3)
            $row[3] = $update.Email
            
            # Update status (column 8) if not already better
            if ($row[8] -notmatch "(Contacted|Sent)") {
                $row[8] = $update.Status
            }
            
            Write-Host "Updated: $company - $contact"
            Write-Host "  Email: $($update.Email)"
            Write-Host "  Source: $($update.Source)"
            Write-Host ""
            
            $updateCount++
        }
    }
}

# Save updated data
$data | ConvertTo-Json -Depth 10 | Out-File "crm-data-updated-march9-1206pm.json"

Write-Host "================================================"
Write-Host "Updated $updateCount contacts"
Write-Host "Saved to: crm-data-updated-march9-1206pm.json"
Write-Host ""
Write-Host "Next step: Push updates to Google Sheet using Node.js"
Write-Host "================================================"
