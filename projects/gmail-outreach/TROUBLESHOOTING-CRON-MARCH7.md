# PE Enrichment Cron - Troubleshooting Guide

## Issue: Node.js and Python Not Available (March 7, 2026 - 3:36 AM)

### Problem Description
When cron job runs, both `node` and `python` commands are not recognized in the PowerShell environment, preventing execution of enrichment scripts.

### Root Cause
- PATH environment variable not set correctly for automated/background execution
- OR Node.js/Python not installed
- OR Running under different user context (cron user vs interactive user)

### Diagnostic Steps

```powershell
# Test Node.js availability
node --version

# Test Python availability
python --version
# OR
py --version
# OR
python3 --version

# Check PATH
$env:PATH

# Find Node.js installation
Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source

# Find Python installation
Get-Command python -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
```

### Solutions

#### Option 1: Fix PATH (Recommended)
```powershell
# Add Node.js to PATH (example paths, adjust based on actual installation)
$env:PATH += ";C:\Program Files\nodejs"

# Add Python to PATH
$env:PATH += ";C:\Python39;C:\Python39\Scripts"

# Make permanent (requires admin):
[System.Environment]::SetEnvironmentVariable("PATH", $env:PATH, [System.EnvironmentVariableTarget]::Machine)
```

#### Option 2: Use Full Paths in Scripts
Instead of calling `node script.js`, use full path:
```powershell
C:\Program Files\nodejs\node.exe C:\path\to\script.js
```

#### Option 3: Use Alternative Execution Method
```powershell
# If OpenClaw has different exec context
openclaw exec --command "node enrich-cron.js" --workdir "projects/gmail-outreach"
```

### Verification
After applying fix, test with:
```powershell
cd C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach
node --version
python --version
node enrich-cron-march7-336am.js
```

### Emergency Fallback
If tooling cannot be fixed immediately:
1. Use manual web research (as done in 3:36 AM run)
2. Document findings in markdown
3. Create update script for sheet (run manually later when tooling available)
4. Focus on high-value targets only

### Prevention
- Add environment check at start of cron script:
```javascript
// At top of enrichment script
const { execSync } = require('child_process');
try {
  const nodeVersion = execSync('node --version').toString();
  console.log(`Node.js available: ${nodeVersion}`);
} catch (err) {
  console.error('FATAL: Node.js not available in PATH');
  process.exit(1);
}
```

## Related Files
- `CRON-COMPLETION-MARCH7-0336AM.md` - Full run report
- `cron-slack-notification-336am.txt` - Brief status update
- `enrich-cron-march7-336am.js` - Created but untested enrichment script
- `find-pe-enrichment-march7.py` - Created but untested Python filter script

## Next Steps
1. [ ] Diagnose PATH issue
2. [ ] Fix Node.js/Python availability
3. [ ] Test scripts manually
4. [ ] Resume automated cron runs
5. [ ] Monitor next run for success
