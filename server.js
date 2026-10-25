/**
 * 🦥 SlothSort Server
 * Pure Node.js built-in HTTP server. Zero npm install required.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { classifyWithLocalEngine, classifyWithOllama, checkOllama } = require('./slothsort');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // API: Status
  if (req.method === 'GET' && pathname === '/api/status') {
    const ollama = await checkOllama();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ready',
      ollama,
      message: 'SlothSort engine online'
    }));
    return;
  }

  // API: Classify single file
  if (req.method === 'POST' && pathname === '/api/classify') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { filename, content } = JSON.parse(body || '{}');
        const ollama = await checkOllama();
        let decision;
        if (ollama.online) {
          try {
            decision = await classifyWithOllama(filename, content);
          } catch {
            decision = classifyWithLocalEngine(filename, content);
          }
        } else {
          decision = classifyWithLocalEngine(filename, content);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(decision));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n=============================================================`);
  console.log(`  🦥 SlothSort Dashboard is running at: http://127.0.0.1:${PORT}`);
  console.log(`  Built for International Sloth Day & Dev.to Hackathon`);
  console.log(`=============================================================\n`);
});
