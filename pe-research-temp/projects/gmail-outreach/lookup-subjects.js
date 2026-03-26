const {google} = require('googleapis');
const fs = require('fs');
const c = require('./credentials.json').web;
const auth = new google.auth.OAuth2(c.client_id, c.client_secret, 'http://localhost');
auth.setCredentials(JSON.parse(fs.readFileSync('token.json')));
const gmail = google.gmail({version:'v1', auth});

(async () => {
  const targets = [
    'ed@knoxlending.com',
    'jason.tanker@renovuscapital.com', 
    'i.baron@comvest.com',
    'ishaikh@shorecp.com',
    'rweishaupt@gaugecapital.com',
    'j.hunter@jllpartners.com',
    'will.overstreet@greatersumventures.com',
    'lierardi@huroncapital.com',
    'tcremieux@waudcapital.com',
    'mconstantinides@revelstokecapital.com'
  ];
  for (const t of targets) {
    const r = await gmail.users.messages.list({userId:'me', q:'from:me to:'+t, maxResults:1});
    if (r.data.messages && r.data.messages.length > 0) {
      const m = await gmail.users.messages.get({userId:'me', id:r.data.messages[0].id, format:'metadata', metadataHeaders:['Subject','To']});
      const subj = m.data.payload.headers.find(h => h.name === 'Subject');
      console.log(t, '|', subj?.value);
    } else {
      console.log(t, '| NO SENT');
    }
  }
})();
