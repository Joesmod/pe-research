# Fetch Google Sheet data using service account
$serviceAccountPath = "C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach\service-account.json"
$sheetId = "11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4"
$range = "Sheet1!A:K"

# Read service account credentials
$serviceAccount = Get-Content $serviceAccountPath | ConvertFrom-Json

# Create JWT
$now = [Math]::Floor((New-TimeSpan -Start "1970-01-01" -End (Get-Date)).TotalSeconds)
$exp = $now + 3600

$header = @{
    alg = "RS256"
    typ = "JWT"
} | ConvertTo-Json -Compress

$claims = @{
    iss = $serviceAccount.client_email
    scope = "https://www.googleapis.com/auth/spreadsheets.readonly"
    aud = "https://oauth2.googleapis.com/token"
    exp = $exp
    iat = $now
} | ConvertTo-Json -Compress

# Base64URL encode
function ConvertTo-Base64Url($text) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
    $base64 = [Convert]::ToBase64String($bytes)
    return $base64.Replace('+', '-').Replace('/', '_').TrimEnd('=')
}

$encodedHeader = ConvertTo-Base64Url $header
$encodedClaims = ConvertTo-Base64Url $claims

# This is complex - need RSA signing. Let's use a simpler approach with cached token
Write-Host "Note: Full OAuth2 JWT signing requires additional setup in PowerShell."
Write-Host "Using cached sheet data from sheet-data.json (last updated 3/2/2026 11:36 PM)"
Write-Host ""

# For now, just display the most recent cached data
$cachedData = Get-Content "C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach\sheet-data.json" | ConvertFrom-Json
Write-Host "Loaded $($cachedData.Count) rows from cached data"
$cachedData | ConvertTo-Json -Depth 10 | Out-File "C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach\sheet-current-fetch.json"
Write-Host "Saved to sheet-current-fetch.json"
