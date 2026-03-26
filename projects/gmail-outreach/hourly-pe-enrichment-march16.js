const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('=== PE Research & Enrichment - Hourly Run ===');
  console.log('Time:', new Date().toISOString());
  
  const findings = [];
  
  try {
    // Authenticate
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Read the sheet
    console.log('\n[1/5] Reading Google Sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      console.log('No data found in sheet.');
      return;
    }

    const headers = rows[0];
    console.log('Headers:', headers);
    
    // Find column indices
    const colIndices = {
      firm: headers.indexOf('Company Name'),
      contact: headers.indexOf('Contact Name'),
      title: headers.indexOf('Position/Title'),
      email: headers.indexOf('Email'),
      linkedin: headers.indexOf('LinkedIn URL'),
      status: headers.indexOf('Status'),
      notes: headers.indexOf('Notes'),
    };

    console.log('Column indices:', colIndices);

    // Identify leads needing enrichment
    console.log('\n[2/5] Identifying leads needing enrichment...');
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firm = row[colIndices.firm] || '';
      const contact = row[colIndices.contact] || '';
      const email = row[colIndices.email] || '';
      const status = row[colIndices.status] || '';

      // Needs enrichment if:
      // - No contact name OR
      // - Generic email (info@, sales@, ir@, contact@)
      const hasGenericEmail = email && (
        email.includes('info@') || 
        email.includes('sales@') || 
        email.includes('ir@') ||
        email.includes('contact@')
      );
      
      const needsContact = !contact || !contact.trim();
      const needsRealEmail = !email || !email.trim() || hasGenericEmail;

      if ((needsContact || needsRealEmail) && firm && firm.trim()) {
        // Skip if Dead/Bounced
        if (status === 'Dead' || status === 'Bounced') {
          continue;
        }

        needsEnrichment.push({
          rowIndex: i + 1,
          firm,
          contact,
          email,
          status,
          needsContact,
          needsRealEmail,
        });
      }
    }

    console.log(`Found ${needsEnrichment.length} leads needing enrichment`);
    
    if (needsEnrichment.length === 0) {
      console.log('✅ All leads are enriched!');
      
      // Save summary
      const summary = {
        timestamp: new Date().toISOString(),
        totalRows: rows.length - 1,
        needsEnrichment: 0,
        enriched: 0,
        message: 'All leads have contact names and verified emails',
      };
      
      fs.writeFileSync(
        path.join(__dirname, 'enrichment-summary-march16-1207am.md'),
        `# PE Enrichment Run - ${new Date().toLocaleString()}\n\n` +
        `✅ **Status**: All leads enriched\n` +
        `📊 **Total leads**: ${summary.totalRows}\n` +
        `🎯 **Needing enrichment**: ${summary.needsEnrichment}\n` +
        `✨ **Enriched this run**: ${summary.enriched}\n`
      );
      
      return;
    }

    // Select top 10-15 for this run
    const targetCount = Math.min(15, needsEnrichment.length);
    const targets = needsEnrichment.slice(0, targetCount);
    
    console.log(`\n[3/5] Researching ${targets.length} firms...`);
    
    // Research each firm
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      console.log(`\n--- Firm ${i + 1}/${targets.length}: ${target.firm} (Row ${target.rowIndex}) ---`);
      
      const research = await researchFirm(target.firm);
      
      if (research.contact) {
        console.log(`✓ Found: ${research.contact} - ${research.title}`);
        console.log(`  Email: ${research.email || 'Not found'}`);
        console.log(`  LinkedIn: ${research.linkedin || 'Not found'}`);
        console.log(`  Source: ${research.source}`);
        
        findings.push({
          rowIndex: target.rowIndex,
          firm: target.firm,
          ...research,
        });
      } else {
        console.log(`✗ No suitable contact found for ${target.firm}`);
        findings.push({
          rowIndex: target.rowIndex,
          firm: target.firm,
          contact: '',
          title: '',
          email: '',
          linkedin: '',
          source: 'Unable to find decision-maker contact',
        });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Update the sheet
    console.log(`\n[4/5] Updating Google Sheet with ${findings.length} findings...`);
    
    for (const finding of findings) {
      if (!finding.contact) continue; // Skip empty findings
      
      const updates = [];
      
      if (finding.contact) {
        updates.push({
          range: `Sheet1!${getColumnLetter(colIndices.contact)}${finding.rowIndex}`,
          values: [[finding.contact]],
        });
      }
      
      if (finding.title) {
        updates.push({
          range: `Sheet1!${getColumnLetter(colIndices.title)}${finding.rowIndex}`,
          values: [[finding.title]],
        });
      }
      
      if (finding.email) {
        updates.push({
          range: `Sheet1!${getColumnLetter(colIndices.email)}${finding.rowIndex}`,
          values: [[finding.email]],
        });
      }
      
      if (finding.linkedin) {
        updates.push({
          range: `Sheet1!${getColumnLetter(colIndices.linkedin)}${finding.rowIndex}`,
          values: [[finding.linkedin]],
        });
      }
      
      // Update status to "Enriched"
      updates.push({
        range: `Sheet1!${getColumnLetter(colIndices.status)}${finding.rowIndex}`,
        values: [['Enriched']],
      });
      
      // Update notes with source
      updates.push({
        range: `Sheet1!${getColumnLetter(colIndices.notes)}${finding.rowIndex}`,
        values: [[finding.source]],
      });
      
      // Batch update
      if (updates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            valueInputOption: 'RAW',
            data: updates,
          },
        });
        
        console.log(`✓ Updated row ${finding.rowIndex}: ${finding.firm}`);
      }
    }

    // Save enrichment results
    console.log('\n[5/5] Saving results and updating GitHub...');
    
    const enrichedCount = findings.filter(f => f.contact).length;
    
    const summary = {
      timestamp: new Date().toISOString(),
      totalNeedingEnrichment: needsEnrichment.length,
      targetedThisRun: targets.length,
      enriched: enrichedCount,
      findings,
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'enrichment-targets-march16-1207am.json'),
      JSON.stringify(summary, null, 2)
    );
    
    // Generate markdown report
    const reportLines = [
      `# PE Enrichment Run - ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`,
      '',
      `## Summary`,
      `- 🎯 **Leads needing enrichment**: ${needsEnrichment.length}`,
      `- 📋 **Targeted this run**: ${targets.length}`,
      `- ✅ **Successfully enriched**: ${enrichedCount}`,
      `- ⏱️  **Duration**: ~${Math.ceil(targets.length * 2 / 60)} minutes`,
      '',
      `## Enriched Contacts`,
      '',
    ];
    
    findings.filter(f => f.contact).forEach((f, idx) => {
      reportLines.push(`### ${idx + 1}. ${f.firm} (Row ${f.rowIndex})`);
      reportLines.push(`- **Contact**: ${f.contact}`);
      reportLines.push(`- **Title**: ${f.title}`);
      reportLines.push(`- **Email**: ${f.email || 'Not found'}`);
      reportLines.push(`- **LinkedIn**: ${f.linkedin || 'Not found'}`);
      reportLines.push(`- **Source**: ${f.source}`);
      reportLines.push('');
    });
    
    if (findings.some(f => !f.contact)) {
      reportLines.push(`## Could Not Enrich`);
      reportLines.push('');
      findings.filter(f => !f.contact).forEach(f => {
        reportLines.push(`- **${f.firm}** (Row ${f.rowIndex}): ${f.source}`);
      });
      reportLines.push('');
    }
    
    reportLines.push(`## Next Steps`);
    reportLines.push(`- ${needsEnrichment.length - targets.length} leads still need enrichment`);
    reportLines.push(`- Next run scheduled for next hour`);
    
    fs.writeFileSync(
      path.join(__dirname, 'enrichment-summary-march16-1207am.md'),
      reportLines.join('\n')
    );
    
    console.log('\n✅ Enrichment run complete!');
    console.log(`📊 Enriched: ${enrichedCount}/${targets.length}`);
    console.log(`📝 Report saved to: enrichment-summary-march16-1207am.md`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    
    // Save error log
    fs.writeFileSync(
      path.join(__dirname, 'enrichment-error-march16-1207am.txt'),
      `Error at ${new Date().toISOString()}\n\n${error.stack}`
    );
    
    process.exit(1);
  }
}

// Research a firm for decision-maker contacts
async function researchFirm(firmName) {
  // This is a placeholder - in real implementation, this would:
  // 1. Search firm website
  // 2. Search LinkedIn
  // 3. Search press releases
  // 4. Verify email format
  
  // For now, return empty (manual research needed)
  return {
    contact: '',
    title: '',
    email: '',
    linkedin: '',
    source: 'Manual research needed - automated web scraping not yet implemented',
  };
}

function getColumnLetter(index) {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode(65 + (index % 26)) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

main();
