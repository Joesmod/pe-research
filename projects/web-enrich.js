// Web-based enrichment when Apollo credits are exhausted
// Scrape team pages for contact info

const FIRMS = [
  { name: 'Trilantic North America', url: 'https://www.trilanticnorthamerica.com', teamUrl: 'https://www.trilanticnorthamerica.com/team' },
  { name: 'Motive Partners', url: 'https://www.motivepartners.com', teamUrl: 'https://www.motivepartners.com/team' },
  { name: 'Genstar Capital', url: 'https://www.genstarcapital.com', teamUrl: 'https://www.genstarcapital.com/team' },
  { name: 'Summit Partners', url: 'https://www.summitpartners.com', teamUrl: 'https://www.summitpartners.com/team' },
  { name: 'PSG Equity', url: 'https://www.psgequity.com', teamUrl: 'https://www.psgequity.com/team' },
  { name: 'American Securities', url: 'https://www.americansecurities.com', teamUrl: 'https://www.americansecurities.com/team' },
  { name: 'Bow River Capital', url: 'https://www.bowrivercapital.com', teamUrl: 'https://www.bowrivercapital.com/team' },
  { name: 'Argosy Private Equity', url: 'https://argosype.com', teamUrl: 'https://argosype.com/team' },
  { name: 'Blue Point Capital Partners', url: 'https://www.bluepointcapital.com', teamUrl: 'https://www.bluepointcapital.com/team' },
  { name: 'LFM Capital', url: 'https://www.lfmcapital.com', teamUrl: 'https://www.lfmcapital.com/team' },
  { name: 'Graham Partners', url: 'https://www.grahampartners.com', teamUrl: 'https://www.grahampartners.com/team' },
  { name: 'Hidden Harbor Capital Partners', url: 'https://www.hiddenharborcp.com', teamUrl: 'https://www.hiddenharborcp.com/team' },
];

module.exports = FIRMS;
