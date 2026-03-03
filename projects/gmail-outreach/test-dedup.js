const { checkDedup } = require('./dedup-guard');

async function test() {
  // Test against someone we already emailed today
  const r1 = await checkDedup('paglialoro@roarkcapital.com', 'AI ops for franchise portfolios like Inspire and Driven Brands');
  console.log('Roark (same subject):', JSON.stringify(r1));

  const r2 = await checkDedup('paglialoro@roarkcapital.com', 'Totally new subject');
  console.log('Roark (new subject):', JSON.stringify(r2));

  // Test against someone we never emailed
  const r3 = await checkDedup('nobody@example.com', 'Test');
  console.log('Nobody:', JSON.stringify(r3));
}

test().catch(e => console.error(e));
