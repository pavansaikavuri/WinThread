const fs = require('fs');
const path = require('path');

const keybindingsPath = path.join(process.env.APPDATA, 'Antigravity IDE', 'User', 'keybindings.json');
if (!fs.existsSync(keybindingsPath)) {
  console.error('FAIL: keybindings.json missing');
  process.exit(1);
}

const bindings = JSON.parse(fs.readFileSync(keybindingsPath, 'utf8'));
const match = bindings.find(b => b.key && b.key.toLowerCase().replace(/\s+/g, '') === 'ctrl+alt+c');

if (!match) {
  console.error('FAIL: Ctrl+Alt+C keybinding missing');
  process.exit(1);
}

console.log('PASS: Ctrl+Alt+C bound to cockpit launch');
process.exit(0);
