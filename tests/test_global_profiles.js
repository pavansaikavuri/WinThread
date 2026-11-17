// tests/test_global_profiles.js
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

const required = [
  'Claude: Nemotron Ultra',
  'OpenCode',
  'OpenCode: DeepSeek V4.1',
  'OpenCode: GLM-5.3 Flash',
  'OpenCode: MiMo-V2.6 Flash',
  'Claude: Nemotron Lightning',
  'Claude: Nemotron Super-VL'
];

for (const name of required) {
  if (!profiles[name]) {
    console.error(`FAIL: Missing terminal profile: ${name}`);
    process.exit(1);
  }
}

// Verify OpenCode command invokes opencode
if (!profiles['OpenCode'].args.some(a => a.includes('opencode'))) {
  console.error('FAIL: OpenCode profile does not invoke opencode');
  process.exit(1);
}

console.log('PASS: All terminal profiles verified in Antigravity settings');
process.exit(0);
