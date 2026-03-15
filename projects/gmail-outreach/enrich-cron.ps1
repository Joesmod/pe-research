# PE Research & Enrichment - Hourly Cron Job
# Reads Google Sheet, identifies leads needing enrichment, uses web search

$ErrorActionPreference = "Stop"

$SHEET_ID = "11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4"
$SERVICE_ACCOUNT = "service-account.json"
$APOLLO_API_KEY = "Fx6RpQS0PKxfVgnxWOPWuw"

# Load service account credentials
$sa = Get-Content $SERVICE_ACCOUNT | ConvertFrom-Json

# Get OAuth2 token for Google Sheets API
function Get-GoogleAccessToken {
    $now = [Math]::Floor([decimal](Get-Date -UFormat %s))
    $exp = $now + 3600
    
    $header = @{
        alg = "RS256"
        typ = "JWT"
    } | ConvertTo-Json -Compress
    
    $claim = @{
        iss = $sa.client_email
        scope = "https://www.googleapis.com/auth/spreadsheets"
        aud = "https://oauth2.googleapis.com/token"
        exp = $exp
        iat = $now
    } | ConvertTo-Json -Compress
    
    # This is simplified - in real impl would need proper JWT signing
    # For now, will use direct API key approach instead
    return $null
}

# Read sheet data
Write-Host "Reading Google Sheet..." -ForegroundColor Cyan

# Alternative: use npx to run node scripts if npm is available
$nodeScript = @"
const { google } = require('googleapis');
(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '$SHEET_ID',
    range: 'Sheet1!A:K'
  });
  console.log(JSON.stringify(response.data.values));
})().catch(console.error);
"@

# Try to find node.exe in common locations
$nodePaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)

$nodeExe = $null
foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $nodeExe = $path
        Write-Host "Found Node.js at: $path" -ForegroundColor Green
        break
    }
}

if (-not $nodeExe) {
    Write-Host "ERROR: Node.js not found. Cannot proceed with enrichment." -ForegroundColor Red
    exit 1
}

# Create temp script
$tempScript = "$PSScriptRoot\temp-read-sheet.js"
$nodeScript | Out-File -FilePath $tempScript -Encoding UTF8

# Run node script
$sheetData = & $nodeExe $tempScript | ConvertFrom-Json

Remove-Item $tempScript -ErrorAction SilentlyContinue

Write-Host "Loaded $($sheetData.Count) rows" -ForegroundColor Green

# Identify leads needing enrichment
$needsEnrichment = @()

for ($i = 1; $i -lt $sheetData.Count; $i++) {
    $row = $sheetData[$i]
    $company = $row[0]
    $contactName = $row[2]  # Column C
    $email = $row[4]        # Column E
    $status = $row[9]       # Column J
    
    # Skip dead/contacted leads
    if ($status -match "Dead|Contacted|Sent") { continue }
    
    # Check if needs enrichment
    $hasGenericEmail = $email -match "info@|sales@|ir@|contact@|press@"
    $hasNoContactName = [string]::IsNullOrWhiteSpace($contactName)
    $hasNoEmail = [string]::IsNullOrWhiteSpace($email)
    
    if ($hasGenericEmail -or $hasNoContactName -or $hasNoEmail) {
        $needsEnrichment += @{
            RowIndex = $i + 1
            Company = $company
            Website = $row[1]
            ContactName = $contactName
            Email = $email
            Status = $status
        }
    }
}

Write-Host "`nFound $($needsEnrichment.Count) leads needing enrichment" -ForegroundColor Yellow

# Limit to 10-15 leads per run
$toEnrich = $needsEnrichment | Select-Object -First 15

Write-Host "Will enrich $($toEnrich.Count) leads this run`n" -ForegroundColor Cyan

# For each lead, search for decision-makers
$enriched = @()

foreach ($lead in $toEnrich) {
    Write-Host "=== Enriching: $($lead.Company) ===" -ForegroundColor White
    
    # TODO: Use Apollo API or web search to find contacts
    # For now, mark as needing manual research
    
    Write-Host "  Needs manual research" -ForegroundColor Yellow
}

Write-Host "`nCron job complete. Enriched $($enriched.Count) leads." -ForegroundColor Green
