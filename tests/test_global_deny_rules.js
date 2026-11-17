const fs = require('fs');
const path = require('path');
const os = require('os');

const globalSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');

console.log(`Checking Global Claude settings at: ${globalSettingsPath}`);

if (!fs.existsSync(globalSettingsPath)) {
  console.error(`FAIL: File does not exist: ${globalSettingsPath}`);
  process.exit(1);
}

const settings = JSON.parse(fs.readFileSync(globalSettingsPath, 'utf8'));

if (!settings.permissions || !Array.isArray(settings.permissions.deny)) {
  console.error('FAIL: permissions.deny is not defined or not an array');
  process.exit(1);
}

const requiredDenyRules = [
  'Read(.env*)',
  'Read(**/.env*)',
  'Read(*id_rsa*)',
  'Read(*id_ed25519*)',
  'Read(**/credentials.json)',
  'Bash(git push*--force*)',
  'Bash(git push*origin main*)',
  'Bash(git push*origin master*)',
  'Bash(rm -rf /*)',
  'Bash(rmdir /s /q C:\\*)'
];

let allPassed = true;
for (const rule of requiredDenyRules) {
  if (settings.permissions.deny.includes(rule)) {
    console.log(`VERIFIED: Hard Deny Rule active -> "${rule}"`);
  } else {
    console.error(`FAIL: Missing required Hard Deny Rule -> "${rule}"`);
    allPassed = false;
  }
}

if (!allPassed) {
  process.exit(1);
}

console.log('PASS: All Global Hard Deny Rules verified successfully');
