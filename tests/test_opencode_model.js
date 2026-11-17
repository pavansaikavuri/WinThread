// tests/test_opencode_model.js
const fs = require('fs');
const path = require('path');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\kavur';
const opencodeConfigPath = path.join(userProfile, '.config', 'opencode', 'opencode.json');

if (!fs.existsSync(opencodeConfigPath)) {
  console.error(`FAIL: OpenCode configuration missing at ${opencodeConfigPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(opencodeConfigPath, 'utf8'));

if (config.model !== 'opencode/deepseek-v4.1-flash-free') {
  console.error(`FAIL: Expected model 'opencode/deepseek-v4.1-flash-free', but found '${config.model}'`);
  process.exit(1);
}

console.log(`PASS: OpenCode default model correctly set to: ${config.model}`);
process.exit(0);
