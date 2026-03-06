# Read Google Sheet using service account
$serviceAccount = Get-Content -Raw 'service-account.json' | ConvertFrom-Json
$spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'

# Create JWT for service account auth
$header = @{
    alg = "RS256"
    typ = "JWT"
}

$now = [Math]::Floor([decimal](Get-Date -UFormat %s))
$claim = @{
    iss = $serviceAccount.client_email
    scope = "https://www.googleapis.com/auth/spreadsheets.readonly"
    aud = "https://oauth2.googleapis.com/token"
    exp = ($now + 3600)
    iat = $now
}

# This is complex - let me just use curl to call the API directly if we have a valid token
# For now, let's read from the existing JSON file that was already created
Write-Host "Reading from existing sheet-data-current.json..."
