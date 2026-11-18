const fs = require('fs');
const path = require('path');

console.log('=== Checking Instant Close Config (Ctrl+Alt+X & Zero Prompt) ===');

// 1. Check settings.json
const settingsPath = path.join(process.env.APPDATA, 'Antigravity IDE', 'User', 'settings.json');
if (!fs.existsSync(settingsPath)) {
  console.error(`FAIL: settings.json not found at ${settingsPath}`);
  process.exit(1);
}

const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
if (settings['terminal.integrated.confirmOnKill'] !== 'never') {
  console.error(`FAIL: 'terminal.integrated.confirmOnKill' is '${settings['terminal.integrated.confirmOnKill']}', expected 'never'`);
  process.exit(1);
}
console.log('PASS: terminal.integrated.confirmOnKill is set to "never"');

// 2. Check keybindings.json
const keybindingsPath = path.join(process.env.APPDATA, 'Antigravity IDE', 'User', 'keybindings.json');
if (!fs.existsSync(keybindingsPath)) {
  console.error(`FAIL: keybindings.json not found at ${keybindingsPath}`);
  process.exit(1);
}

const keybindings = JSON.parse(fs.readFileSync(keybindingsPath, 'utf8'));
const closeBinding = keybindings.find(b => b.key && b.key.toLowerCase().replace(/\s+/g, '') === 'ctrl+alt+x');

if (!closeBinding) {
  console.error("FAIL: Missing keybinding for 'ctrl+alt+x'");
  process.exit(1);
}

if (closeBinding.command !== 'runCommands' || !closeBinding.args || !Array.isArray(closeBinding.args.commands)) {
  console.error("FAIL: 'ctrl+alt+x' must be configured as 'runCommands' with commands array");
  process.exit(1);
}

const subCommands = closeBinding.args.commands.map(c => c.command);
const requiredSubCommands = [
  'workbench.action.focusFourthEditorGroup',
  'workbench.action.focusThirdEditorGroup',
  'workbench.action.focusSecondEditorGroup',
  'workbench.action.focusFirstEditorGroup',
  'workbench.action.closeActiveEditor',
  'workbench.action.editorLayoutSingle'
];

let allFound = true;
for (const req of requiredSubCommands) {
  if (subCommands.includes(req)) {
    console.log(`VERIFIED: sub-command present in ctrl+alt+x -> ${req}`);
  } else {
    console.error(`FAIL: Missing required sub-command in ctrl+alt+x -> ${req}`);
    allFound = false;
  }
}

if (!allFound) {
  process.exit(1);
}

console.log('PASS: Instant close configuration verified successfully');
process.exit(0);
