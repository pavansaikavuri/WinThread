const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', '.vscode', 'claudebuild.json');
if (!fs.existsSync(configPath)) {
  console.error('FAIL: claudebuild.json missing');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (!config.panes || config.panes.length !== 3) {
  console.error(`FAIL: Expected 3 panes, found ${config.panes ? config.panes.length : 0}`);
  process.exit(1);
}

const expectedModels = [
  'model/nemotron-3-ultra',
  'model/nemotron-3.5-super-vl',
  'model/nemotron-3.5-lightning'
];

for (let i = 0; i < 3; i++) {
  if (config.panes[i].model !== expectedModels[i]) {
    console.error(`FAIL: Pane ${i} model mismatch: ${config.panes[i].model}`);
    process.exit(1);
  }
}

console.log('PASS: claudebuild.json schema valid');
process.exit(0);
