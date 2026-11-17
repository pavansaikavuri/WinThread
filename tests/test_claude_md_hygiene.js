const fs = require('fs');
const path = require('path');
const os = require('os');

const claudeMdPath = path.join(os.homedir(), '.claude', 'CLAUDE.md');

console.log(`Checking CLAUDE.md hygiene at: ${claudeMdPath}`);

if (!fs.existsSync(claudeMdPath)) {
  console.error(`FAIL: File does not exist: ${claudeMdPath}`);
  process.exit(1);
}

const content = fs.readFileSync(claudeMdPath, 'utf8');

// 1. Check for core behavioral pillars
const requiredPillars = [
  'Think Before Coding',
  'Simplicity First',
  'Surgical Changes',
  'Goal-Driven Execution',
  'Project & Knowledge Routing Map'
];

let allPassed = true;
for (const pillar of requiredPillars) {
  if (content.includes(pillar)) {
    console.log(`VERIFIED: Core pillar present -> "${pillar}"`);
  } else {
    console.error(`FAIL: Missing pillar -> "${pillar}"`);
    allPassed = false;
  }
}

// 2. Check for Non-Code Routing Map paths
const requiredPaths = [
  'docs/features',
  'docs/reference',
  'C:\\Users\\kavur\\Brain'
];

for (const p of requiredPaths) {
  if (content.includes(p)) {
    console.log(`VERIFIED: Non-code routing path documented -> "${p}"`);
  } else {
    console.error(`FAIL: Missing non-code routing path -> "${p}"`);
    allPassed = false;
  }
}

// 3. Check for prompt shouting (unnecessary all-caps words like ALWAYS, NEVER, IMPORTANT! in directives)
const shoutingPatterns = [
  /\bALWAYS\b/,
  /\bNEVER\b/,
  /\bCRITICAL\b/
];

let foundShouting = false;
for (const pattern of shoutingPatterns) {
  if (pattern.test(content)) {
    console.error(`FAIL: Found all-caps prompt yelling matching ${pattern}`);
    foundShouting = true;
    allPassed = false;
  }
}

if (!foundShouting) {
  console.log('VERIFIED: Clean prompt hygiene (no all-caps shouting)');
}

if (!allPassed) {
  process.exit(1);
}

console.log('PASS: CLAUDE.md hygiene and routing map verified successfully');
