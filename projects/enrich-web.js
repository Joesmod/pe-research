// Web-search based enrichment - writes results to stdout for manual review
const targets = [
  { row: 93, name: 'Apax Partners', existingContact: 'Mark Beith' },
  { row: 195, name: 'Vance Street Capital', existingContact: 'Natalie Yates' },
  { row: 198, name: 'Valeas Capital Partners', existingContact: 'Rob Little' },
  { row: 117, name: 'Keltic Financial Partners', existingContact: '' },
  { row: 156, name: 'TPG Capital', existingContact: '' },
  { row: 161, name: 'Thomas H. Lee Partners', existingContact: '' },
  { row: 49, name: 'Francisco Partners', existingContact: 'Dipanjan Deb' },
];

targets.forEach(t => {
  console.log(JSON.stringify(t));
});
