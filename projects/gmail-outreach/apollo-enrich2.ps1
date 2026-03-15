# Apollo API enrichment for PE firms
$apiKey = "Fx6RpQS0PKxfVgnxWOPWuw"
$headers = @{
    "Content-Type" = "application/json"
    "Cache-Control" = "no-cache"
    "X-Api-Key" = $apiKey
}

# Load firms needing enrichment
$needs = Get-Content needs-enrichment.json | ConvertFrom-Json
$highPriority = $needs | Where-Object { $_.Priority -eq "HIGH" } | Select-Object -First 12

Write-Host "Enriching $($highPriority.Count) high-priority PE firms via Apollo API..."
Write-Host ""

$enriched = @()

foreach ($firm in $highPriority) {
    Write-Host "[$($firm.RowIndex)] $($firm.Firm)"
    
    # Search for people at this firm
    $searchBody = @{
        "q_organization_name" = $firm.Firm
        "person_titles" = @(
            "Managing Partner",
            "Managing Director",
            "Partner",
            "CEO",
            "President",
            "Co-Founder",
            "General Partner"
        )
        "per_page" = 5
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.apollo.io/v1/mixed_people/search" -Method Post -Headers $headers -Body $searchBody
        
        if ($response.people -and $response.people.Count -gt 0) {
            $person = $response.people[0]
            
            $enriched += [PSCustomObject]@{
                RowIndex = $firm.RowIndex
                Firm = $firm.Firm
                ContactName = $person.name
                Title = $person.title
                Email = $person.email
                LinkedIn = $person.linkedin_url
                Source = "Apollo API verified"
                Confidence = $person.email_status
            }
            
            Write-Host "   Found: $($person.name) - $($person.title)"
            Write-Host "   Email: $($person.email) (status: $($person.email_status))"
            Write-Host ""
        } else {
            Write-Host "   No contacts found"
            Write-Host ""
        }
        
        Start-Sleep -Milliseconds 500
        
    } catch {
        Write-Host "   API Error: $($_.Exception.Message)"
        Write-Host ""
    }
}

Write-Host ""
Write-Host "Enriched $($enriched.Count) firms successfully"
$enriched | ConvertTo-Json -Depth 10 | Set-Content "apollo-enriched.json"
Write-Host "Saved to apollo-enriched.json"
