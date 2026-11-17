// tests/test_idempotent_keybindings.js
const fs = require('fs');
const path = require('path');

const kbPath = path.join(process.env.APPDATA, 'Antigravity IDE', 'User', 'keybindings.json');
if (!fs.existsSync(kbPath)) {
  console.error('FAIL: keybindings.json missing');
  process.exit(1);
}

const bindings = JSON.parse(fs.readFileSync(kbPath, 'utf8'));

// Check for cycle keybinding when terminal is active
const cycleMatch = bindings.find(b => 
  b.key && b.key.toLowerCase().replace(/\s+/g, '') === 'ctrl+alt+c' &&
  b.when && b.when.includes('activeEditor ==') && b.when.includes('terminalEditor')
);

// Check for open keybinding when terminal is NOT active
const openMatch = bindings.find(b => 
  b.key && b.key.toLowerCase().replace(/\s+/g, '') === 'ctrl+alt+c' &&
  b.when && b.when.includes('activeEditor !=') && b.when.includes('terminalEditor')
);

// Check for reset keybinding
const resetMatch = bindings.find(b => 
  b.key && b.key.toLowerCase().replace(/\s+/g, '') === 'ctrl+alt+shift+c'
);

if (!cycleMatch || !openMatch || !resetMatch) {
  console.error(`FAIL: Required idempotent keybindings missing. cycle: ${!!cycleMatch}, open: ${!!openMatch}, reset: ${!!resetMatch}`);
  process.exit(1);
}

console.log('PASS: Idempotent keybindings configured');
process.exit(0);
