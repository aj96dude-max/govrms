const dns = require('dns');
const { promisify } = require('util');

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

async function checkDns() {
  const hostname = '_mongodb._tcp.govrsm.xvzebxv.mongodb.net';
  const txtHostname = 'govrsm.xvzebxv.mongodb.net';

  try {
    console.log('Attempting standard SRV lookup...');
    const srvRecords = await resolveSrv(hostname);
    console.log('SRV Records:', srvRecords);

    console.log('Attempting standard TXT lookup...');
    const txtRecords = await resolveTxt(txtHostname);
    console.log('TXT Records:', txtRecords);
    
    // Construct Standard URI
    const nodes = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
    const options = txtRecords.flat().join('&');
    const standardUri = `mongodb://aj96dude_db_user:hJWaMYKhKcKKUCur@${nodes}/govrms?${options}`;
    console.log('\nStandard Connection String:', standardUri);

  } catch (err) {
    console.error('Standard lookup failed:', err.message);

    console.log('\nAttempting lookup via 8.8.8.8...');
    dns.setServers(['8.8.8.8']);
    
    try {
      const srvRecords = await resolveSrv(hostname);
      console.log('SRV Records (8.8.8.8):', srvRecords);
      
      const txtRecords = await resolveTxt(txtHostname);
      console.log('TXT Records (8.8.8.8):', txtRecords);

      const nodes = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
      const options = txtRecords.flat().join('&');
      const standardUri = `mongodb://aj96dude_db_user:hJWaMYKhKcKKUCur@${nodes}/govrms?${options}`;
      console.log('\nStandard Connection String (8.8.8.8):', standardUri);

    } catch (err2) {
      console.error('Lookup via 8.8.8.8 also failed:', err2.message);
    }
  }
}

checkDns();
