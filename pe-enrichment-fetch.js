const https = require('https');
const http = require('http');
const {URL} = require('url');

const firms = [
  {row:103,name:"Performant Capital",website:"https://performantcapital.com",teamPaths:["/about.php","/team.php"]},
  {row:104,name:"Hellman & Friedman",website:"https://www.hf.com",teamPaths:["/people/","/meet-the-hf-team/"]},
  {row:106,name:"Stellus Capital Management",website:"https://www.stelluscapital.com",teamPaths:["/team/"]},
  {row:107,name:"Odyssey Investment Partners",website:"https://www.odysseyinvestment.com",teamPaths:["/team/","/about/"]},
  {row:108,name:"Spell Capital Partners",website:"https://www.spellcapital.com",teamPaths:["/our-team/"]},
  {row:111,name:"Quad Partners",website:"https://www.quadpartners.com",teamPaths:["/team/","/about/"]},
  {row:112,name:"CI Capital Partners",website:"https://www.cicapitalpartners.com",teamPaths:["/team/","/people/"]},
  {row:122,name:"Keltic Financial Partners",website:"https://www.kelticfp.com",teamPaths:["/"]},
  {row:123,name:"Angeles Equity Partners",website:"https://www.angelesequity.com",teamPaths:["/team"]},
  {row:124,name:"CM Equity Partners",website:"https://www.cmequity.com",teamPaths:["/","/team"]},
  {row:125,name:"Sound Growth Partners",website:"https://www.soundgrowthpartners.com",teamPaths:["/team","/about"]},
  {row:126,name:"Broadwing Capital",website:"https://www.broadwingcapital.com",teamPaths:["/team","/about"]},
  {row:128,name:"Tonka Bay Equity Partners",website:"https://www.tonkabayequity.com",teamPaths:["/team"]},
  {row:129,name:"Centerbridge Partners",website:"https://www.centerbridge.com",teamPaths:["/team","/people"]},
  {row:130,name:"Platinum Equity",website:"https://www.platinumequity.com",teamPaths:["/team","/about/leadership"]},
  {row:131,name:"Vector Capital",website:"https://www.vectorcapital.com",teamPaths:["/team","/people"]},
  {row:132,name:"Crestview Partners",website:"https://www.crestview.com",teamPaths:["/team","/people"]},
  {row:135,name:"Blackford Capital",website:"https://www.blackfordcapital.com",teamPaths:["/people/"]},
  {row:136,name:"Stellex Capital Management",website:"https://www.stellexcapital.com",teamPaths:["/team/"]},
  {row:138,name:"MidOcean Partners",website:"https://www.midoceanpartners.com",teamPaths:["/our-people/","/people/"]},
  {row:139,name:"TruArc Partners",website:"https://www.truarcpartners.com",teamPaths:["/team"]},
  {row:141,name:"Veritas Capital",website:"https://www.veritascapital.com",teamPaths:["/team/"]},
  {row:142,name:"Bertram Capital",website:"https://www.bertramcapital.com",teamPaths:["/team"]},
  {row:143,name:"Calera Capital",website:"https://www.caleracapital.com",teamPaths:["/our-team.html","/about-us/our-team.html"]},
  {row:144,name:"Topspin Partners",website:"https://www.topspinpartners.com",teamPaths:["/team/"]},
  {row:145,name:"Primus Capital",website:"https://www.primuscapital.com",teamPaths:["/meet-the-team","/team"]},
  {row:146,name:"Waud Capital Partners",website:"https://www.waudcapital.com",teamPaths:["/en/team/"]},
  {row:147,name:"GI Partners",website:"https://www.gipartners.com",teamPaths:["/team"]},
  {row:148,name:"Oak Hill Capital",website:"https://www.oakhillcapital.com",teamPaths:["/team","/people"]},
  {row:151,name:"Arcline Investment Management",website:"https://www.arcline.com",teamPaths:["/about/","/people/"]},
  {row:152,name:"Brockway Moran & Partners",website:"https://www.brockwaymoran.com",teamPaths:["/team","/"]},
  {row:153,name:"TowerBrook Capital Partners",website:"https://www.towerbrook.com",teamPaths:["/people/","/about/"]},
  {row:154,name:"H.I.G. Capital",website:"https://hig.com",teamPaths:["/team/","/leadership/"]},
  {row:155,name:"Searchlight Capital Partners",website:"https://searchlightcap.com",teamPaths:["/team","/people"]},
  {row:156,name:"Crescendo Capital Partners",website:"https://www.crescendocap.com",teamPaths:["/team","/about"]},
  {row:157,name:"SRM Equity Partners",website:"https://www.srmequity.com",teamPaths:["/team","/about"]},
  {row:158,name:"Investcorp",website:"https://www.investcorp.com",teamPaths:["/about/leadership","/team"]},
  {row:159,name:"Warburg Pincus",website:"https://www.warburgpincus.com",teamPaths:["/team/","/people/"]},
  {row:160,name:"Thoma Bravo",website:"https://www.thomabravo.com",teamPaths:["/team/","/people/"]},
  {row:161,name:"Insight Partners",website:"https://www.insightpartners.com",teamPaths:["/team/","/about/"]},
  {row:162,name:"TPG Capital",website:"https://www.tpg.com",teamPaths:["/people/","/team/"]},
  {row:163,name:"Onex Corporation",website:"https://www.onex.com",teamPaths:["/team/","/people/"]},
  {row:164,name:"Welsh Carson Anderson & Stowe",website:"https://www.wcas.com",teamPaths:["/team/","/people/"]},
  {row:165,name:"EQT Partners",website:"https://eqtgroup.com",teamPaths:["/people/","/team/"]},
  {row:166,name:"Leonard Green & Partners",website:"https://www.leonardgreen.com",teamPaths:["/team/","/people/"]},
  {row:167,name:"Thomas H. Lee Partners",website:"https://www.thl.com",teamPaths:["/team/","/people/"]},
  {row:168,name:"Bain Capital Private Equity",website:"https://www.baincapitalprivateequity.com",teamPaths:["/team/","/people/"]},
  {row:169,name:"Cinven",website:"https://www.cinven.com",teamPaths:["/team/","/people/"]},
  {row:170,name:"Permira",website:"https://www.permira.com",teamPaths:["/team/","/people/"]},
  {row:171,name:"Providence Equity Partners",website:"https://www.provequity.com",teamPaths:["/team/","/people/"]},
  {row:172,name:"Cerberus Capital Management",website:"https://www.cerberus.com",teamPaths:["/team/","/people/"]},
  {row:173,name:"Pritzker Private Capital",website:"https://www.ppcpartners.com",teamPaths:["/team/","/people/"]},
  {row:174,name:"Clearlake Capital Group",website:"https://clearlake.com",teamPaths:["/team/","/people/"]},
  {row:175,name:"Madison Dearborn Partners",website:"https://www.mdcp.com",teamPaths:["/team/","/people/"]},
  {row:176,name:"JC Flowers & Co",website:"https://www.jcfco.com",teamPaths:["/team/","/people/"]},
  {row:177,name:"Braemont Capital",website:"https://www.braemontcapital.com",teamPaths:["/team","/about"]},
  {row:178,name:"PSP Partners",website:"https://www.psppartners.com",teamPaths:["/team","/people"]},
  {row:179,name:"Nordic Capital",website:"https://www.nordiccapital.com",teamPaths:["/team/","/people/"]},
  {row:180,name:"One Equity Partners",website:"https://www.oneequity.com",teamPaths:["/team/","/people/"]},
  {row:181,name:"Oakley Capital",website:"https://www.oakleycapital.com",teamPaths:["/team/","/people/"]},
  {row:182,name:"Hg Capital",website:"https://www.hgcapital.com",teamPaths:["/team/","/people/"]},
  {row:183,name:"Everstone Capital",website:"https://www.everstonecapital.com",teamPaths:["/team/","/people/"]},
  {row:184,name:"GoldenTree Asset Management",website:"https://www.goldentreeam.com",teamPaths:["/team/","/about/"]},
  {row:185,name:"Consonance Capital",website:"https://www.consonancecapital.com",teamPaths:["/team/","/people/"]},
  {row:186,name:"Revelstoke Capital Partners",website:"https://www.revelstokecapital.com",teamPaths:["/team/","/people/"]},
  {row:187,name:"KKR Healthcare",website:"https://www.kkr.com",teamPaths:["/team/","/people/"]},
  {row:188,name:"Carlyle Group Healthcare",website:"https://www.carlyle.com",teamPaths:["/team/","/people/"]},
  {row:189,name:"Summit Park",website:"https://summitparkllc.com",teamPaths:["/team/","/people/"]},
  {row:191,name:"Thompson Street Capital Partners",website:"https://www.thompsonstcap.com",teamPaths:["/team/","/people/"]},
  {row:192,name:"Mill Point Capital",website:"https://www.millpointcapital.com",teamPaths:["/team/","/people/"]},
  {row:193,name:"Great Hill Partners",website:"https://www.greathillpartners.com",teamPaths:["/team/","/people/"]},
  {row:194,name:"Vestar Capital Partners",website:"https://www.vestarcapital.com",teamPaths:["/team/","/people/"]},
  {row:195,name:"Norwest Equity Partners",website:"https://nep.com",teamPaths:["/team/","/people/"]},
  {row:197,name:"Flexpoint Ford",website:"https://www.flexpointford.com",teamPaths:["/team/","/people/"]},
  {row:199,name:"Sagewind Capital",website:"https://www.sagewindcapital.com",teamPaths:["/team/","/people/"]},
  {row:200,name:"CIP Capital",website:"https://www.cipcapital.com",teamPaths:["/team/","/people/"]}
];

function fetchPage(url, timeout=5000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({error:'timeout'}), timeout);
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(timer);
        const loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        fetchPage(loc, timeout).then(resolve);
        return;
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { clearTimeout(timer); resolve({status:res.statusCode, html:data.substring(0,50000)}); });
    });
    req.on('error', (e) => { clearTimeout(timer); resolve({error:e.message}); });
  });
}

function extractNames(html) {
  // Remove script/style
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  const results = [];
  
  // Pattern 1: Name in heading tags with title nearby
  const headingPattern = /<h[2-5][^>]*>(.*?)<\/h[2-5]>/gi;
  let match;
  const headings = [];
  while ((match = headingPattern.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text && text.split(/\s+/).length >= 2 && text.split(/\s+/).length <= 5 && !text.match(/team|about|our|meet|overview|leader|join|career/i)) {
      headings.push({text, index: match.index});
    }
  }
  
  // Pattern 2: Look for title patterns near names
  const titlePattern = /(?:Managing\s+(?:Partner|Director|Member)|Partner|Principal|(?:Co-)?(?:Founder|CEO|COO|CFO|CTO)|(?:Senior\s+)?(?:Vice\s+President|VP)|(?:Operating\s+Partner)|(?:Managing\s+Director)|(?:Head\s+of\s+\w+)|(?:Director|Chief))/gi;
  
  // Extract text content
  const textContent = html.replace(/<[^>]+>/g, '\n').replace(/\s+/g, ' ');
  
  // Look for "Name Title" patterns
  const nameTitle = /([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[,\n\r|–-]*\s*((?:Co-)?(?:Managing|Senior|Executive|Chief|Head|Operating|General)\s+(?:Partner|Director|Member|Officer|Counsel|Advisor)|(?:Co-)?(?:Founder|Partner|Principal|CEO|COO|CFO|CTO|VP|MD)|(?:Vice\s+President))/gi;
  
  while ((match = nameTitle.exec(textContent)) !== null) {
    const name = match[1].trim();
    const title = match[2].trim();
    if (name.length > 3 && name.length < 40) {
      results.push({name, title});
    }
  }
  
  // LinkedIn URLs
  const linkedinPattern = /linkedin\.com\/(?:in|company)\/([^"'\s<>]+)/gi;
  const linkedins = [];
  while ((match = linkedinPattern.exec(html)) !== null) {
    linkedins.push(match[0]);
  }
  
  // Email patterns
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = [];
  while ((match = emailPattern.exec(html)) !== null) {
    if (!match[0].includes('example.com') && !match[0].includes('sentry')) {
      emails.push(match[0]);
    }
  }
  
  return {people: results.slice(0, 10), linkedins: linkedins.slice(0, 5), emails: emails.slice(0, 5)};
}

async function processFirm(firm) {
  for (const path of firm.teamPaths) {
    const url = firm.website + path;
    const result = await fetchPage(url);
    if (result.html && result.status === 200) {
      const extracted = extractNames(result.html);
      if (extracted.people.length > 0 || extracted.linkedins.length > 0) {
        return {firm: firm.name, row: firm.row, url, ...extracted};
      }
    }
  }
  return {firm: firm.name, row: firm.row, people: [], linkedins: [], emails: []};
}

async function main() {
  // Process in batches of 10
  const results = [];
  for (let i = 0; i < firms.length; i += 10) {
    const batch = firms.slice(i, i + 10);
    const batchResults = await Promise.all(batch.map(f => processFirm(f)));
    results.push(...batchResults);
    process.stderr.write(`Processed ${Math.min(i+10, firms.length)}/${firms.length}\n`);
  }
  
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
