const { sendEmail } = require('./send.js');

const testBody = `This is paragraph one.

This is paragraph two after a double line break.
This is a single line break.
Another single line break.

Final paragraph after double break.`;

sendEmail('aljensen92@gmail.com', 'Line Break Test - Fixed', testBody)
  .then(() => console.log('Test email sent successfully'))
  .catch(err => console.error('Error:', err));
