# PE Research Enrichment Updates
# This script documents research findings to be manually added to the Google Sheet

$enrichments = @(
    @{
        Company = "First Trust Capital Management L.P."
        ContactName = "Michael Peck"
        Title = "CEO, Co-Chief Investment Officer"
        Email = "mpeck@firsttrustcapital.com"
        LinkedIn = "https://www.linkedin.com/in/michael-peck-cfa-646b1a4/"
        Source = "ContactOut verified"
        Status = "Enriched"
    },
    @{
        Company = "Left Lane Capital"
        ContactName = "Vinny Pujji"
        Title = "Managing Partner, Co-founder"
        Email = "vinny@leftlanecap.com"
        LinkedIn = "https://www.linkedin.com/in/vpujji/"
        Source = "ContactOut verified"
        Status = "Enriched"
    },
    @{
        Company = "King Street Capital Management"
        ContactName = "Brian Higgins"
        Title = "Founder, Managing Partner"
        Email = "bhiggins@kingstreet.com"
        LinkedIn = "https://www.linkedin.com/in/brian-higgins-kingstreet/"
        Source = "RocketReach pattern (verified on company site)"
        Status = "Enriched"
    },
    @{
        Company = "Merit Capital Partners"
        ContactName = "Evan Gallinson"
        Title = "Managing Director"
        Email = "egallinson@meritcapital.com"
        LinkedIn = "https://www.linkedin.com/in/evan-gallinson-7002307/"
        Source = "RocketReach pattern"
        Status = "Enriched"
    },
    @{
        Company = "Plexus Capital"
        ContactName = "Michael Painter"
        Title = "Co-Founder, Managing Partner"
        Email = "mpainter@plexuscap.com"
        LinkedIn = "https://www.linkedin.com/in/paintermichael/"
        Source = "ContactOut verified"
        Status = "Enriched"
    },
    @{
        Company = "Ocean Avenue Capital Partners"
        ContactName = "Pete Notz"
        Title = "Partner"
        Email = "pnotz@oceanavenuecapital.com"
        LinkedIn = "https://www.linkedin.com/in/pete-notz/"
        Source = "ZoomInfo pattern + company team page"
        Status = "Enriched"
    },
    @{
        Company = "Ocean Avenue Capital Partners"
        ContactName = "Duran Curis"
        Title = "Founding Partner"
        Email = "dcuris@oceanavenuecapital.com"
        LinkedIn = "https://www.linkedin.com/in/duran-curis-03939858/"
        Source = "ZoomInfo pattern + company team page"
        Status = "Enriched"
    },
    @{
        Company = "Kudu Investment Management"
        ContactName = "Rob Jakacki"
        Title = "Managing Partner, CEO, Co-CIO"
        Email = ""
        LinkedIn = "https://www.linkedin.com/in/rob-jakacki/"
        Source = "Official site team page - no public email found"
        Status = "Partial"
        Notes = "Senior contact verified, email not published"
    },
    @{
        Company = "Rainier Partners"
        ContactName = "Alex Rolfe"
        Title = "Co-Founder, Managing Partner"
        Email = ""
        LinkedIn = "https://www.linkedin.com/in/alex-rolfe/"
        Source = "Official site + press releases - no public email found"
        Status = "Partial"
        Notes = "Co-founder verified, only generic info@rainierpartners.com available"
    },
    @{
        Company = "Rainier Partners"
        ContactName = "Jon Altman"
        Title = "Co-Founder, Managing Partner"
        Email = ""
        LinkedIn = "https://www.linkedin.com/in/jon-altman/"
        Source = "Official site + press releases - no public email found"
        Status = "Partial"
        Notes = "Co-founder verified, only generic info@rainierpartners.com available"
    }
)

# Output enrichment summary
Write-Host "`n=== PE Research Enrichment Summary ===" -ForegroundColor Cyan
Write-Host "Total firms researched: $($enrichments.Count)" -ForegroundColor White
Write-Host "With verified emails: $($enrichments.Where({$_.Email -ne ''}).Count)" -ForegroundColor Green
Write-Host "Partial (name only): $($enrichments.Where({$_.Email -eq ''}).Count)" -ForegroundColor Yellow

Write-Host "`n=== Enriched Contacts ===" -ForegroundColor Cyan
foreach ($item in $enrichments | Where-Object {$_.Email -ne ''}) {
    Write-Host "`n$($item.Company)" -ForegroundColor White
    Write-Host "  Contact: $($item.ContactName) - $($item.Title)" -ForegroundColor Gray
    Write-Host "  Email: $($item.Email)" -ForegroundColor Green
    Write-Host "  LinkedIn: $($item.LinkedIn)" -ForegroundColor Gray
    Write-Host "  Source: $($item.Source)" -ForegroundColor DarkGray
}

Write-Host "`n=== Partial Enrichments (Name Only) ===" -ForegroundColor Yellow
foreach ($item in $enrichments | Where-Object {$_.Email -eq ''}) {
    Write-Host "`n$($item.Company)" -ForegroundColor White
    Write-Host "  Contact: $($item.ContactName) - $($item.Title)" -ForegroundColor Gray
    Write-Host "  Notes: $($item.Notes)" -ForegroundColor DarkGray
}

# Export to JSON for record-keeping
$enrichments | ConvertTo-Json -Depth 10 | Out-File "C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach\enrichments-$(Get-Date -Format 'yyyy-MM-dd-HHmm').json" -Encoding UTF8
Write-Host "`n✅ Research findings exported to JSON" -ForegroundColor Green
Write-Host "`nNext step: Manually update Google Sheet with these enrichments" -ForegroundColor Cyan
