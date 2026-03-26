#!/usr/bin/env node

const https = require('https');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

/**
 * Enrich a contact by Apollo ID to get full details including email
 */
async function enrichContact(apolloId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      id: apolloId,
      reveal_personal_emails: false,
      reveal_phone_number: false
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/people/match',
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(responseData);
            resolve(parsed);
          } catch (err) {
            reject(new Error(`Failed to parse response: ${err.message}`));
          }
        } else {
          reject(new Error(`API returned status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

// CLI usage
if (require.main === module) {
  const apolloId = process.argv[2];
  if (!apolloId) {
    console.error('Usage: node apollo-enrich.js "<apollo ID>"');
    process.exit(1);
  }

  enrichContact(apolloId)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

module.exports = { enrichContact };
