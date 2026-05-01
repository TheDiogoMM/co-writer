const pdf = require('pdf-parse');
const fs = require('fs');

async function test() {
  console.log('PDF Parse loaded');
  // Just testing if the module can be called
  try {
    const data = await pdf(Buffer.from(''));
    console.log('PDF Parse call successful (empty buffer)');
  } catch(e) {
    console.log('Expected error or success:', e.message);
  }
}
test();
