const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;

fetch(url).then(r => r.text()).then(t => {
  const lines = t.trim().split('\n').slice(1);
  let missing = [];
  for (const line of lines) {
    const cols = [];
    const re = /"([^"]*)"/g;
    let m;
    while ((m = re.exec(line)) !== null) cols.push(m[1]);
    const company = cols[0] || '';
    const contact = cols[1] || '';
    const title = cols[2] || '';
    const email = cols[3] || '';
    if (!email.trim()) {
      missing.push({ company, contact, title });
    }
  }
  console.log('MISSING EMAIL COUNT:', missing.length);
  missing.forEach((m, i) => console.log((i + 1) + '. ' + m.company + ' | ' + m.contact + ' | ' + m.title));
}).catch(console.error);
