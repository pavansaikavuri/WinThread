// tests/test_global_config.js
const fs = require('fs');
const path = require('path');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\kavur';
const globalConfigPath = path.join(userProfile, '.claudebuild', 'config.json');

if (!fs.existsSync(globalConfigPath)) {
  console.error(`FAIL: Global config missing at ${globalConfigPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'));

if (!config.panes || config.panes.length !== 4) {
  console.error(`FAIL: Expected 4 panes, found ${config.panes ? config.panes.length : 0}`);
  process.exit(1);
}

const expectedOrder = [
  { id: 'pane-ultra', pos: 'top-left', title: 'Claude: Nemotron Ultra' },
  { id: 'pane-opencode', pos: 'top-right', title: 'OpenCode' },
  { id: 'pane-lightning', pos: 'bottom-left', title: 'Claude: Nemotron Lightning' },
  { id: 'pane-super', pos: 'bottom-right', title: 'Claude: Nemotron Super-VL' }
];

for (let i = 0; i < 4; i++) {
  const p = config.panes[i];
  const exp = expectedOrder[i];
  if (p.id !== exp.id || p.position !== exp.pos || p.title !== exp.title) {
    console.error(`FAIL: Pane ${i} mismatch. Found: ${JSON.stringify(p)} vs Expected: ${JSON.stringify(exp)}`);
    process.exit(1);
  }
}

console.log('PASS: Global 4-pane cockpit configuration verified');
process.exit(0);
