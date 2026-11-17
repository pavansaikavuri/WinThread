const fs = require('fs');
const path = require('path');

const settingsPath = path.join(process.env.APPDATA, 'Antigravity IDE', 'User', 'settings.json');
if (!fs.existsSync(settingsPath)) {
  console.error('FAIL: settings.json missing');
  process.exit(1);
}

const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const profiles = settings['terminal.integrated.profiles.windows'];

if (!profiles) {
  console.error('FAIL: No Windows terminal profiles found');
  process.exit(1);
}

const expectedProfiles = [
  'Claude: Nemotron Ultra',
  'Claude: Nemotron Super-VL',
  'Claude: Nemotron Lightning'
];

for (const name of expectedProfiles) {
  if (!profiles[name]) {
    console.error(`FAIL: Missing terminal profile: ${name}`);
    process.exit(1);
  }
}

console.log('PASS: All terminal profiles registered in Antigravity IDE');
process.exit(0);
