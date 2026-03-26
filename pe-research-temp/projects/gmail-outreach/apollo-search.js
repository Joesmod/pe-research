#!/usr/bin/env node

const https = require('https');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

/**
 * Search for contacts at a specific company with Apollo API
 */
async function searchContacts(orgName, titles = ['Partner', 'Managing Director', 'Managing Partner']) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: orgName,
      person_titles: titles,
      page: 1,
      per_page: 10
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/api_search',
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
  const orgName = process.argv[2];
  if (!orgName) {
    console.error('Usage: node apollo-search.js "<organization name>"');
    process.exit(1);
  }

  searchContacts(orgName)
    .then(results => {
      console.log(JSON.stringify(results, null, 2));
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

module.exports = { searchContacts };
