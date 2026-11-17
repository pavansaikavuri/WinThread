// tests/verify_engine_commands.js
const fs = require('fs');
const path = require('path');

const appPath = 'C:/Users/kavur/AppData/Local/Programs/Antigravity IDE/resources/app/out/vs/workbench/workbench.desktop.main.js';
if (!fs.existsSync(appPath)) {
  console.error(`FAIL: Antigravity IDE engine binary not found at ${appPath}`);
  process.exit(1);
}

const engineContent = fs.readFileSync(appPath, 'utf8');

const keybindingsPath = path.join(process.env.APPDATA, 'Antigravity IDE', 'User', 'keybindings.json');
if (!fs.existsSync(keybindingsPath)) {
  console.error(`FAIL: keybindings.json not found at ${keybindingsPath}`);
  process.exit(1);
}

const bindings = JSON.parse(fs.readFileSync(keybindingsPath, 'utf8'));

// Extract all command IDs executed in keybindings
const commandsToCheck = new Set();
for (const b of bindings) {
  if (b.command && b.command !== 'runCommands') {
    commandsToCheck.add(b.command);
  }
  if (b.args && b.args.commands) {
    for (const sub of b.args.commands) {
      if (sub.command) {
        commandsToCheck.add(sub.command);
      }
    }
  }
}

console.log('Commands extracted from keybindings.json:', Array.from(commandsToCheck));

let hasError = false;
for (const cmd of commandsToCheck) {
  // Exact match inside quotes: e.g. "workbench.action.command" or 'workbench.action.command'
  const regex = new RegExp(`["']${cmd}["']`);
  if (!regex.test(engineContent)) {
    console.error(`FAIL: Command '${cmd}' is NOT an exact registered command in the Antigravity IDE engine!`);
    hasError = true;
  } else {
    console.log(`VERIFIED: '${cmd}' is an exact registered command`);
  }
}

if (hasError) {
  process.exit(1);
}

console.log('PASS: All keybinding commands verified against engine binary with zero errors');
process.exit(0);
