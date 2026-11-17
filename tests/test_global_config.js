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
  { id: 'pane-ultra', pos: 'top-left', title: 'Claude: Nemotron Ultra', model: 'model/nemotron-3-ultra' },
  { id: 'pane-opencode', pos: 'top-right', title: 'OpenCode: DeepSeek V4.1', model: 'opencode/deepseek-v4.1-flash-free' },
  { id: 'pane-lightning', pos: 'bottom-left', title: 'Claude: Nemotron Lightning', model: 'model/nemotron-3.5-lightning' },
  { id: 'pane-super', pos: 'bottom-right', title: 'Claude: Nemotron Super-VL', model: 'model/nemotron-3.5-super-vl' }
];

for (let i = 0; i < 4; i++) {
  const p = config.panes[i];
  const exp = expectedOrder[i];
  if (p.id !== exp.id || p.position !== exp.pos || p.title !== exp.title || p.model !== exp.model) {
    console.error(`FAIL: Pane ${i} mismatch.\nFound: ${JSON.stringify(p)}\nExpected: ${JSON.stringify(exp)}`);
    process.exit(1);
  }
}

console.log('PASS: Global 4-pane cockpit configuration verified with DeepSeek V4.1');
process.exit(0);
