/**
 * 🦥 SlothSort - The Zero-Effort Local File & Desktop Tidier
 * Built for International Sloth Day & the Dev.to "Slow and Steady" Open-Source AI Challenge.
 *
 * Core Principles:
 * 1. 100% Local & Private: Your sensitive receipts, photos, and files never leave your machine.
 * 2. Rewards Laziness: Run one command and go take a nap.
 * 3. Open AI at the Core: Works with local open-weight models (Ollama / Llama 3.2 / Qwen / SmolLM)
 *    with a zero-dependency local semantic fallback.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const CONFIG = {
  ollamaUrl: 'http://localhost:11434',
  preferredModel: process.env.SLOTH_MODEL || 'llama3.2', // or qwen2.5, smollm2, mistral
  slowAndSteadyDelayMs: 250 // Conserves CPU & fan energy (the sloth way)
};

// Target categories
const CATEGORIES = [
  'Receipts & Invoices',
  'Work & Documents',
  'Code & Configs',
  'Memes & Photos',
  'Installers & Archives',
  'Media & Audio',
  'Misc & Notes'
];

/**
 * Checks if local Ollama server is running
 */
async function checkOllama() {
  return new Promise((resolve) => {
    const req = http.get(`${CONFIG.ollamaUrl}/api/tags`, { timeout: 1500 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const models = (json.models || []).map(m => m.name);
          resolve({ online: true, models });
        } catch {
          resolve({ online: false, models: [] });
        }
      });
    });
    req.on('error', () => resolve({ online: false, models: [] }));
    req.on('timeout', () => { req.destroy(); resolve({ online: false, models: [] }); });
  });
}

/**
 * Classifies a file using a local open-weight model via Ollama
 */
async function classifyWithOllama(filename, sampleContent = '') {
  const prompt = `You are SlothSort, an automated file organizer. 
Analyze this file:
Filename: "${filename}"
Preview: "${sampleContent.slice(0, 300)}"

Choose EXACTLY ONE category from this list:
${CATEGORIES.map(c => `- ${c}`).join('\n')}

Also propose a clean, human-readable renamed filename in kebab-case (preserve original extension).

Respond ONLY with valid JSON in this exact format:
{"category": "Chosen Category", "suggestedName": "clean-filename.ext", "reason": "brief 5-word reason"}`;

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: CONFIG.preferredModel,
      prompt,
      stream: false,
      format: 'json'
    });

    const req = http.request(`${CONFIG.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 8000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const result = JSON.parse(parsed.response);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(payload);
    req.end();
  });
}

/**
 * Built-in open heuristic & semantic fallback engine (works with zero external setup)
 */
function classifyWithLocalEngine(filename, sampleContent = '') {
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename, ext).toLowerCase();
  const text = (base + ' ' + sampleContent).toLowerCase();

  let category = 'Misc & Notes';
  let cleanName = base.replace(/[\s_()+-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  if (['.pdf', '.csv', '.xlsx', '.xls'].includes(ext) || /receipt|invoice|bill|statement|tax|payment|order|payroll/.test(text)) {
    category = 'Receipts & Invoices';
    if (!cleanName.includes('receipt') && !cleanName.includes('invoice') && !cleanName.includes('tax')) {
      cleanName = `receipt-${cleanName}`;
    }
  } else if (['.docx', '.doc', '.pptx', '.txt', '.md', '.rtf', '.odt'].includes(ext) || /resume|spec|brief|draft|report|proposal|meeting/.test(text)) {
    category = 'Work & Documents';
    if (/screenshot/.test(cleanName)) category = 'Memes & Photos';
  } else if (['.js', '.ts', '.py', '.json', '.html', '.css', '.rs', '.go', '.yml', '.yaml', '.sh', '.env'].includes(ext) || /config|docker|script|main|app/.test(text)) {
    category = 'Code & Configs';
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
    category = 'Memes & Photos';
    if (/screenshot|screen_shot|capture/.test(cleanName)) {
      cleanName = cleanName.replace(/screenshot|screen_shot|capture/, 'screenshot');
    }
  } else if (['.zip', '.tar', '.gz', '.rar', '.7z', '.exe', '.dmg', '.pkg', '.msi', '.iso'].includes(ext)) {
    category = 'Installers & Archives';
  } else if (['.mp3', '.wav', '.flac', '.mp4', '.mov', '.mkv'].includes(ext)) {
    category = 'Media & Audio';
  }

  // Prepend date if not present
  const today = new Date().toISOString().split('T')[0];
  if (!/^\d{4}-\d{2}-\d{2}/.test(cleanName)) {
    cleanName = `${today}-${cleanName}`;
  }

  return {
    category,
    suggestedName: `${cleanName}${ext}`,
    reason: `Semantic match on ${ext || 'file content'}`
  };
}

/**
 * Main Sorting Process
 */
async function sortDirectory(targetDir, options = { dryRun: true }) {
  console.log('\n=============================================================');
  console.log('  🦥  SLOTH-SORT: Slow and Steady Autonomous File Tidier  🦥');
  console.log('=============================================================');
  console.log(`📂 Target Folder: ${path.resolve(targetDir)}`);
  console.log(`⚙️  Mode:          ${options.dryRun ? 'DRY-RUN (Simulating)' : 'LIVE (Moving Files)'}`);

  const ollamaStatus = await checkOllama();
  if (ollamaStatus.online) {
    console.log(`🧠 AI Engine:     Local Ollama active (Found: ${ollamaStatus.models.join(', ') || 'ready'})`);
  } else {
    console.log(`🧠 AI Engine:     Standalone Local Semantic Engine (Privacy-First Offline Mode)`);
  }
  console.log('-------------------------------------------------------------\n');

  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Directory not found: ${targetDir}`);
    return;
  }

  const entries = fs.readdirSync(targetDir);
  const files = entries.filter(name => {
    const fullPath = path.join(targetDir, name);
    return fs.statSync(fullPath).isFile() && !name.startsWith('.');
  });

  if (files.length === 0) {
    console.log('✨ Folder is already completely clean! Go back to relaxing. 🦥💤\n');
    return;
  }

  console.log(`🔍 Found ${files.length} cluttered files. Proceeding at sloth pace...\n`);

  const results = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const fullPath = path.join(targetDir, filename);

    // Read small text preview if applicable
    let sampleContent = '';
    try {
      const ext = path.extname(filename).toLowerCase();
      if (['.txt', '.md', '.json', '.csv', '.js', '.py', '.html', '.yml'].includes(ext)) {
        sampleContent = fs.readFileSync(fullPath, 'utf8').slice(0, 500);
      }
    } catch {
      // Ignore binary files
    }

    let decision;
    if (ollamaStatus.online) {
      try {
        decision = await classifyWithOllama(filename, sampleContent);
      } catch {
        decision = classifyWithLocalEngine(filename, sampleContent);
      }
    } else {
      decision = classifyWithLocalEngine(filename, sampleContent);
    }

    results.push({
      original: filename,
      category: decision.category,
      suggestedName: decision.suggestedName || filename,
      reason: decision.reason
    });

    console.log(` [${i + 1}/${files.length}] 🦥 Processing: ${filename}`);
    console.log(`      📁 Destination: ${decision.category}/`);
    console.log(`      🏷️  Rename to:   ${decision.suggestedName}`);
    console.log(`      💡 Reason:      ${decision.reason}`);

    if (!options.dryRun) {
      const destFolder = path.join(targetDir, decision.category);
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }
      const destPath = path.join(destFolder, decision.suggestedName);
      fs.renameSync(fullPath, destPath);
      console.log(`      ✅ Moved cleanly!`);
    }

    // Sloth delay: keeps CPU cool and fans quiet
    await new Promise(r => setTimeout(r, CONFIG.slowAndSteadyDelayMs));
  }

  console.log('\n=============================================================');
  console.log('🎉 SLOTH REPORT: Tidy complete while you conserved energy!');
  console.log(`📊 Total Files Handled:  ${files.length}`);
  console.log(`🔋 Energy Conserved:      100%`);
  console.log(`😴 Human Effort Expended: 0%`);
  if (options.dryRun) {
    console.log(`\n💡 To execute these changes for real, run:`);
    console.log(`   node slothsort.js "${targetDir}" --apply`);
  }
  console.log('=============================================================\n');
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const targetDir = args.find(a => !a.startsWith('--')) || path.join(__dirname, 'test-messy-folder');
  const isApply = args.includes('--apply');

  sortDirectory(targetDir, { dryRun: !isApply });
}

module.exports = { sortDirectory, classifyWithLocalEngine, classifyWithOllama, checkOllama };
