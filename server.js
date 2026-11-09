// 本地测试用：node server.js
// 需要 AMD_API_KEY 环境变量，例如：AMD_API_KEY=rc-... node server.js
// 然后打开 http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');
const translate = require('./api/translate');

const PORT = process.env.PORT || 3000;
const server = http.createServer(async (req, res) => {
  if (req.url === '/api/translate' && req.method === 'POST') {
    let raw = '';
    req.on('data', c => raw += c);
    req.on('end', async () => {
      try { req.body = JSON.parse(raw || '{}'); } catch { req.body = {}; }
      // 适配 Vercel 的 res.status().json() 到原生 http
      res.status = (code) => ({ json: (obj) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(obj)); }, end: () => res.end() });
      res.json = (obj) => { res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(obj)); };
      await translate(req, res);
    });
    return;
  }
  if (req.url === '/api/translate' && req.method === 'OPTIONS') {
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }
  const file = req.url === '/' ? 'index.html' : req.url.slice(1);
  const fp = path.join(__dirname, file);
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': file.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/plain' });
  fs.createReadStream(fp).pipe(res);
});
server.listen(PORT, () => console.log(`Translator running at http://localhost:${PORT}`));
