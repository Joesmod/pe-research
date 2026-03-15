# Manual PE Research - March 7, 2:36 AM
# Identifies high-priority leads needing enrichment

Write-Host "PE RESEARCH & ENRICHMENT - MANUAL SESSION" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Based on last enrichment run, these are top priority firms with "Partial" status
# that need decision-maker contacts with direct emails

$priorityFirms = @(
    @{ Company = "Manulife | Comvest Credit Partners"; Website = "https://www.comvestcredit.com" }
    @{ Company = "Pzena Investment Management"; Website = "https://www.pzena.com" }
    @{ Company = "Riverwood Capital"; Website = "https://www.riverwoodcapital.com" }
    @{ Company = "Sageview Capital"; Website = "https://www.sageviewcapital.com" }
    @{ Company = "Silver Oak Services Partners"; Website = "https://www.silveroaksp.com" }
    @{ Company = "STORY3 Capital Partners"; Website = "https://www.story3capital.com" }
    @{ Company = "Strategic Value Partners"; Website = "https://www.svpglobal.com" }
    @{ Company = "Thrive Capital"; Website = "https://www.thrivecap.com" }
    @{ Company = "American Industrial Partners"; Website = "https://www.american-industrial.com" }
    @{ Company = "Wind Point Partners"; Website = "https://www.windpointpartners.com" }
    @{ Company = "Peak Rock Capital"; Website = "https://www.peakrockcapital.com" }
    @{ Company = "CCMP Capital"; Website = "https://www.ccmpcapital.com" }
    @{ Company = "Accel-KKR"; Website = "https://www.accel-kkr.com" }
    @{ Company = "Salt Creek Capital"; Website = "https://www.saltcreekcapital.com" }
    @{ Company = "Warren Equity Partners"; Website = "https://www.warrenequity.com" }
)

Write-Host "PRIORITY FIRMS FOR MANUAL RESEARCH:" -ForegroundColor Yellow
Write-Host "====================================`n" -ForegroundColor Yellow

$count = 1
foreach ($firm in $priorityFirms) {
    Write-Host "$count. $($firm.Company)" -ForegroundColor White
    Write-Host "   Website: $($firm.Website)" -ForegroundColor Gray
    Write-Host ""
    $count++
}

Write-Host "`nACTION ITEMS:" -ForegroundColor Green
Write-Host "1. Search firm website /team or /about pages" -ForegroundColor Gray
Write-Host "2. Search LinkedIn: site:linkedin.com [Firm Name] [Title]" -ForegroundColor Gray
Write-Host "3. Search Apollo.io for people at firm domain" -ForegroundColor Gray
Write-Host "4. Document findings with: Name, Title, Email (verified), LinkedIn URL" -ForegroundColor Gray
Write-Host "5. Update Google Sheet rows with enriched data" -ForegroundColor Gray
Write-Host "6. Set Status = 'Enriched' when complete`n" -ForegroundColor Gray

Write-Host "RESEARCH TARGETS (C-level, Partners, Directors, VPs):" -ForegroundColor Cyan
Write-Host "- CEO, CTO, COO, CMO, CFO" -ForegroundColor Gray
Write-Host "- Managing Partner, Operating Partner, General Partner" -ForegroundColor Gray
Write-Host "- Directors: Technology, Product, Operations, Marketing, Digital, BD" -ForegroundColor Gray
Write-Host "- VPs: Technology, Operations, Digital Transformation, Portfolio Ops" -ForegroundColor Gray
Write-Host "- Heads of: Value Creation, Portfolio Operations, Business Development`n" -ForegroundColor Gray

Write-Host "Starting manual research session..." -ForegroundColor Yellow
