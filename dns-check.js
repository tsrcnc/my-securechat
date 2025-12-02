const dns = require('dns');

const domain = 'tsrcnceducators.in';
const recordName = `_my-securechat-verification.${domain}`;
const doubleRecordName = `_my-securechat-verification.${domain}.${domain}`;

console.log(`Checking DNS TXT records...`);

function check(name) {
    dns.resolveTxt(name, (err, records) => {
        if (err) {
            console.log(`[${name}]: Error - ${err.code}`);
        } else {
            console.log(`[${name}]: Found records:`, JSON.stringify(records));
        }
    });
}

check(recordName);
check(doubleRecordName);
