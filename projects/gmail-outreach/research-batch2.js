const {google} = require('googleapis');
const https = require('https');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Pre-researched firm data
const firms = [
  {name:"Kohlberg & Company", website:"https://kohlberg.com", portfolio:"Houghton International, SiO2 Materials Science, AmeriLife, Birds Eye Foods", sector:"Industrials, consumer, healthcare, financial services", aum:"$6B+ total capital raised", tech:"Portfolio digitization focus; tech-enabled services investments", news:"Active mid-market buyout platform; recent fund closings"},
  {name:"Renovus Capital Partners", website:"https://renovuscapital.com", portfolio:"Frontline Education, NovaPoint Capital, NextGen Global Resources", sector:"Education, knowledge-based services, tech-enabled services", aum:"$500M+", tech:"Strong focus on tech-enabled education and knowledge services", news:"Education sector specialist; continued deal activity in edtech"},
  {name:"Diversis Capital", website:"https://diversiscapital.com", portfolio:"VPay, Greenphire, Dealer Tire", sector:"Tech-enabled services, healthcare IT, financial services", aum:"$1B+", tech:"Invests in technology-driven business services companies", news:"Growing mid-market platform with tech services focus"},
  {name:"Apax Partners", website:"https://apax.com", portfolio:"Thoughtworks, Sophos, Exact Software, Inmarsat", sector:"Tech & telecom, healthcare, services, consumer", aum:"$80B+ total funds raised", tech:"Major tech sector investor; digital transformation leader; Thoughtworks ownership", news:"Global PE leader; recent large-cap tech and healthcare deals"},
  {name:"Waud Capital Partners", website:"https://waudcapital.com", portfolio:"One Call, NovaBay Pharmaceuticals, US Physical Therapy", sector:"Healthcare services, business services", aum:"$3B+ capital committed", tech:"Healthcare IT modernization; tech-enabled care delivery", news:"Healthcare services specialist; active in physician practice management"},
  {name:"Comvest Partners", website:"https://comvest.com", portfolio:"Xactly, Hyland Software, Omnitracs, Confluent Health", sector:"Software, healthcare, business services, industrial", aum:"$9B+ AUM", tech:"Significant software and tech investments; SaaS portfolio companies", news:"Active credit and equity investor; recent software platform deals"},
  {name:"Bertram Capital", website:"https://bertramcapital.com", portfolio:"Digital River, Smarsh, Kforce", sector:"Technology, business services, consumer", aum:"$2B+", tech:"'Digital Transformation' value creation playbook; proprietary tech tools", news:"Lower middle market focus with strong tech transformation thesis"},
  {name:"Revelstoke Capital Partners", website:"https://revelstokecapital.com", portfolio:"Confluent Health, VitalConnect, OrthoGrid Systems", sector:"Healthcare services", aum:"$4B+", tech:"Healthtech and digital health investments; tech-enabled care", news:"Healthcare services specialist; recent platform acquisitions"},
  {name:"New Harbor Capital", website:"https://newharborcap.com", portfolio:"Paradigm, Edmentum, Frontline Education", sector:"Education, healthcare, business services", aum:"$1.5B+", tech:"Tech-enabled services focus; education technology platforms", news:"Lower middle market; education and healthcare deal activity"},
  {name:"Svoboda Capital Partners", website:"https://svobodacapital.com", portfolio:"Proven Behavior Solutions, IMC, Integrated Rehabilitation", sector:"Healthcare, business services", aum:"$500M+", tech:"Healthcare IT enablement; operational digitization", news:"Chicago-based lower middle market firm; healthcare services focus"},
  {name:"Clearview Capital", website:"https://clearviewcap.com", portfolio:"Broadpoint, Nexus Health Capital, US Ecology", sector:"Business services, healthcare, industrial", aum:"$1B+", tech:"Operational improvement through technology adoption", news:"Lower middle market buyouts; continued services sector deal flow"},
  {name:"Pamlico Capital", website:"https://pamlicocapital.com", portfolio:"Avalara (early), Passport Labs, Appia Communications", sector:"Technology, communications, business services", aum:"$3B+", tech:"Growth equity in technology and tech-enabled services", news:"Tech-focused growth equity; software and communications investments"},
  {name:"Pfingsten Partners", website:"https://pfingsten.com", portfolio:"Lakeside Foods, Midwest Folding Products, National Service Alliance", sector:"Niche manufacturing, specialty distribution, business services", aum:"$1.5B+", tech:"Operational tech modernization in traditional industries", news:"Lower middle market industrials focus; active add-on acquisition strategy"},
  {name:"Capstreet", website:"https://capstreet.com", portfolio:"GreenStar, Anuvu, Foundation Software", sector:"Tech-enabled services, software, industrial services", aum:"$1B+", tech:"'Operating Partners' model with technology focus; software investments", news:"Houston-based; tech-enabled services platform building"},
  {name:"Alpine Investors", website:"https://alpineinvestors.com", portfolio:"Apex Service Partners, Vensure Employer Services, SAM (now Montrose)", sector:"Software, services, healthcare", aum:"$16B+ AUM", tech:"PeopleFirst approach with strong software focus; CEO-in-Training program", news:"Rapid growth; raised $3.6B Fund IX; named top PE firm by Inc."},
  {name:"WindRose Health Investors", website:"https://windrosehealth.com", portfolio:"PharMerica, BioScrip, CareCore National", sector:"Healthcare services, pharma services, managed care", aum:"$2B+", tech:"Healthcare technology and analytics; pharmacy tech platforms", news:"Healthcare-dedicated PE; pharmacy and specialty health investments"},
  {name:"Trivest Partners", website:"https://trivest.com", portfolio:"Mastery Logistics, Kforce, Total Military Management", sector:"Business services, consumer, industrial", aum:"$4B+", tech:"Technology enablement in founder-led businesses", news:"Founder-focused PE; Miami-based; continued lower middle market deals"},
  {name:"Endeavour Capital", website:"https://endeavourcapital.com", portfolio:"Ater Wynne, Absorbent Products, Beaverton Foods", sector:"Consumer, business services, food & beverage", aum:"$500M+", tech:"Moderate - operational improvements with tech adoption", news:"Pacific Northwest focused; founder-friendly approach"},
  {name:"Berkshire Partners", website:"https://berkshirepartners.com", portfolio:"Dunkin' Brands, Party City, Frontier Communications, Carter's", sector:"Consumer, communications, business services, healthcare", aum:"$16B+ capital raised", tech:"Technology investments in portfolio; consumer tech enablement", news:"Long-standing Boston PE firm; diverse sector portfolio; recent fund close"},
  {name:"Edison Partners", website:"https://edisonpartners.com", portfolio:"Cleo, Petal, Gyant, Protagonist Technology", sector:"Healthcare IT, fintech, enterprise software", aum:"$2B+", tech:"Growth equity focused on technology companies; HealthTech, FinTech, EdTech", news:"Tech-focused growth equity; active HealthTech investor"},
  {name:"Excellere Partners", website:"https://excellerepartners.com", portfolio:"CST Industries, IEC Electronics, PharmaRite", sector:"Industrial, business services, healthcare", aum:"$500M+", tech:"Operational technology improvements; manufacturing tech", news:"Lower middle market; industrials and services focus"},
  {name:"Metamora Growth Partners", website:"https://metamoragrowth.com", portfolio:"Various lower middle market services companies", sector:"Business services, healthcare services", aum:"$200M+", tech:"Tech-enabled services; digital transformation in portfolio", news:"Emerging lower middle market firm; services sector focus"},
  {name:"Trive Capital", website:"https://trivecapital.com", portfolio:"CoolSys, Apex Analytix, AmWINS Group", sector:"Business services, industrial services, technology", aum:"$3B+", tech:"Technology-driven operational improvement; data analytics", news:"Dallas-based; raised Fund III; active in business services M&A"},
  {name:"Levine Leichtman Capital Partners", website:"https://llcp.com", portfolio:"Loyalty Ventures, Therapy Brands, Dealer Tire", sector:"Franchise, healthcare, business services, consumer", aum:"$12B+", tech:"Structured investments in tech-enabled businesses; healthcare IT", news:"Global PE firm; active structured equity strategy; recent healthcare deals"},
  {name:"Consonance Capital", website:"https://consonancecapital.com", portfolio:"Netsmart Technologies, Streamline Health, Precision Medicine Group", sector:"Healthcare, life sciences", aum:"$1B+", tech:"Healthcare IT and life sciences technology; digital health focus", news:"Healthcare-dedicated; health IT and precision medicine investments"},
  {name:"Flexpoint Ford", website:"https://flexpointford.com", portfolio:"AssuredPartners, CURO Group, Efinancial", sector:"Financial services, healthcare", aum:"$6B+", tech:"InsurTech and FinTech enablement; digital financial services", news:"Financial services specialist; insurance platform building"},
  {name:"Serent Capital", website:"https://serentcapital.com", portfolio:"Qualifacts, MedBridge, Podium Education", sector:"Business services, software, healthcare IT", aum:"$4B+", tech:"Software and tech-enabled services focus; SaaS investments", news:"Growth equity in services and software; raised new fund"},
  {name:"Quad Partners", website:"https://quadpartners.com", portfolio:"Springstone, Fusion Academy, Catapult Learning", sector:"Education, healthcare, professional services", aum:"$800M+", tech:"EdTech platforms; tech-enabled education delivery", news:"Education and healthcare specialist; special education focus"},
  {name:"Blackford Capital", website:"https://blackfordcapital.com", portfolio:"Cadillac Products, Koops Automation, Universal Forest Products", sector:"Manufacturing, industrial, distribution", aum:"$500M+", tech:"Industry 4.0 and manufacturing technology adoption", news:"Grand Rapids-based; lower middle market manufacturing deals"},
  {name:"Crescendo Capital Partners", website:"https://crescendocap.com", portfolio:"Various tech-enabled services companies", sector:"Technology services, business services", aum:"$300M+", tech:"Tech-enabled services specialist; digital transformation", news:"Emerging firm focused on tech-enabled lower middle market"},
  {name:"Welsh Carson Anderson & Stowe", website:"https://welshcarson.com", portfolio:"Concentra, US Physical Therapy, Optiv Security, Solera Health", sector:"Healthcare, technology", aum:"$40B+ total raised", tech:"Major healthcare IT and cybersecurity investor; tech sector dedicated team", news:"Top-tier PE firm; raised $4.3B Fund XIII; Optiv cybersecurity investment"},
  {name:"Pritzker Private Capital", website:"https://pritzkerprivatecapital.com", portfolio:"Conair, Marlin Equity, Various industrial companies", sector:"Manufacturing, distribution, business services", aum:"$5B+", tech:"Digital operations improvement; smart manufacturing", news:"Pritzker family office PE; long-term hold strategy; industrial focus"},
  {name:"Thompson Street Capital Partners", website:"https://tscp.com", portfolio:"Insightra Medical, Veriforce, Spotless Brands", sector:"Healthcare, business services, consumer services", aum:"$5B+", tech:"Tech-enabled healthcare and business services; data analytics platforms", news:"St. Louis-based; raised Fund V; healthcare and services platform building"},
  {name:"PSG Equity", website:"https://psgequity.com", portfolio:"Solver, Cornerstone OnDemand, Odoo, Ivanti", sector:"Software (exclusively)", aum:"$14B+", tech:"Pure-play software investor; SaaS, enterprise software, vertical software", news:"Leading software PE firm; rapid AUM growth; prolific software deal maker"},
  {name:"Performant Capital", website:"https://performantcapital.com", portfolio:"Various B2B software companies", sector:"B2B software, SaaS", aum:"$500M+", tech:"Software-only focus; operational improvement in SaaS businesses", news:"Emerging software-focused PE; B2B SaaS specialist"},
  {name:"Odyssey Investment Partners", website:"https://odysseyinvestment.com", portfolio:"Sitel Group, Ranpak, Berlin Packaging (early)", sector:"Industrial, business services, consumer", aum:"$8B+", tech:"Operations technology; supply chain digitization", news:"Middle market PE; industrials and services; recent fund activity"},
  {name:"CI Capital Partners", website:"https://cicapitalpartners.com", portfolio:"Chapters Health, Wellspring Health, Various healthcare cos", sector:"Healthcare, business services, industrial", aum:"$3B+", tech:"Healthcare technology adoption; operational digitization", news:"Experienced middle market firm; healthcare and services deals"},
  {name:"Angeles Equity Partners", website:"https://angelesequity.com", portfolio:"Ducommun, Ventura Aerospace, Pacific Enterprises", sector:"Aerospace, defense, industrial manufacturing", aum:"$1B+", tech:"Advanced manufacturing technology; aerospace digitization", news:"LA-based; aerospace and defense specialist; value-oriented approach"},
  {name:"Crestview Partners", website:"https://crestview.com", portfolio:"Convatec, Sabre Industries, CentralSquare Technologies", sector:"Media, energy, financial services, industrial", aum:"$10B+", tech:"GovTech (CentralSquare); media technology; digital infrastructure", news:"Diversified middle market PE; recent media and tech deals"},
  {name:"TruArc Partners", website:"https://truarcpartners.com", portfolio:"Haynes Wire, Ranpak, Brand Industrial Services", sector:"Industrial, business services, consumer", aum:"$4B+", tech:"Digital operations improvement; industrial technology", news:"Formerly Snow Phipps; rebranded 2023; continued middle market deals"},
  {name:"Veritas Capital", website:"https://veritascapital.com", portfolio:"Peraton, DXC Technology (Veritas slice), Alion Science", sector:"Government technology, defense, healthcare IT", aum:"$36B+", tech:"Major GovTech and defense technology investor; cybersecurity, cloud, AI for government", news:"Top defense tech PE firm; Peraton/Perspecta merger; massive fund raises"},
  {name:"Calera Capital", website:"https://caleracapital.com", portfolio:"Novetta, Imagine Communications, Greenway Health", sector:"Technology, healthcare IT, business services", aum:"$1.5B+", tech:"Healthcare IT and technology services focus; SaaS investments", news:"Middle market technology and healthcare IT investments"},
  {name:"Primus Capital", website:"https://primuscapital.com", portfolio:"Netsmart Technologies (early), MedVentive, Phytel", sector:"Healthcare IT, enterprise software", aum:"$1.5B+", tech:"Healthcare IT specialist; EHR and health data analytics investments", news:"Cleveland-based; healthcare IT growth equity; long track record"},
  {name:"GI Partners", website:"https://gipartners.com", portfolio:"Ceridian (via investments), Cologix, Peak 10 Data Centers", sector:"Healthcare, IT infrastructure, services, real estate", aum:"$32B+", tech:"Major data center and IT infrastructure investor; tech-forward thesis", news:"Large diversified PE; data center investments; raised new fund"},
  {name:"Madison Dearborn Partners", website:"https://mdcp.com", portfolio:"Asure Software, nThrive, Avanade, CDW (early)", sector:"TMT, healthcare, financial services, business services", aum:"$28B+ total raised", tech:"Major TMT investor; healthcare IT; digital transformation focus", news:"Chicago-based flagship PE; raised Fund VIII; active TMT deal pipeline"},
  {name:"PSP Partners", website:"https://psppartners.com", portfolio:"Various middle market operating companies", sector:"Business services, industrials, consumer", aum:"$1B+", tech:"Operational improvement including technology modernization", news:"Pritzker-affiliated; Chicago-based; long-term oriented PE"},
  {name:"One Equity Partners", website:"https://oneequity.com", portfolio:"Duravant, Welbilt, Berlin Packaging", sector:"Industrial, packaging, food equipment, healthcare", aum:"$10B+", tech:"Smart manufacturing; industrial IoT; operational technology", news:"Former JPMorgan PE arm; independent since 2015; active industrials deals"},
  {name:"Summit Park", website:"https://summitpark.com", portfolio:"Various lower middle market services companies", sector:"Business services, healthcare, tech-enabled services", aum:"$800M+", tech:"Tech-enabled services platform building; digital operations", news:"Lower middle market focus; services sector specialist"},
  {name:"Great Hill Partners", website:"https://greathillpartners.com", portfolio:"Bombas, Wayfair (early), ZocDoc, Clarkston Consulting", sector:"Technology, healthcare, digital media, consumer internet", aum:"$9B+", tech:"Strong tech and digital consumer focus; SaaS and internet investments", news:"Boston-based growth PE; raised Fund VIII; active tech and digital deals"},
  {name:"Vestar Capital Partners", website:"https://vestarcapital.com", portfolio:"Birds Eye Foods, Kevita, Sun Products, Caliber Collision", sector:"Consumer, healthcare, industrial, distribution", aum:"$11B+ total raised", tech:"Consumer technology enablement; supply chain digitization", news:"Middle market PE; consumer and healthcare focus; experienced team"},
];

async function run() {
  const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  
  const rows = firms.map(f => [
    f.name, '', f.website, f.portfolio, f.sector, f.aum, f.tech, f.news
  ]);
  
  // Now enrich with Apollo data for better descriptions where possible
  for (let i = 0; i < firms.length; i++) {
    const domain = firms[i].website.replace('https://','');
    try {
      const data = JSON.stringify({api_key: APOLLO_KEY, domain});
      const result = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname:'api.apollo.io', path:'/api/v1/organizations/enrich',
          method:'POST', headers:{'Content-Type':'application/json','Content-Length':data.length}
        }, res => {
          let body=''; res.on('data',c=>body+=c);
          res.on('end',()=>{ try{resolve(JSON.parse(body))}catch(e){resolve({})} });
        });
        req.on('error',()=>resolve({}));
        req.write(data); req.end();
      });
      
      const org = result.organization;
      if (org) {
        // Enhance sector if Apollo has industry info
        if (org.industry && !rows[i][4]) rows[i][4] = org.industry;
        // Add city/state to news if we have it
        if (org.city && org.state) {
          rows[i][7] = `HQ: ${org.city}, ${org.state}. ${rows[i][7]}`;
        }
        if (org.estimated_num_employees) {
          rows[i][7] += ` (~${org.estimated_num_employees} employees)`;
        }
      }
      console.log(`[${i+1}/50] ${firms[i].name} - Apollo: ${org ? 'OK' : 'no data'}`);
    } catch(e) {
      console.log(`[${i+1}/50] ${firms[i].name} - Apollo error`);
    }
    
    // Small delay between API calls
    await new Promise(r => setTimeout(r, 250));
  }
  
  // Append all rows at once
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Company Intel!A:H',
    valueInputOption: 'RAW',
    requestBody: { values: rows }
  });
  
  console.log(`\nDone! Appended ${rows.length} rows to Company Intel tab.`);
}

run().catch(e => console.error(e));
