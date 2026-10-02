// Batch MCP stdio client for the Reticle daemon (3.5.x).
// Usage: node scripts/mcp-drive.mjs <steps.json>
// steps.json: [{ "tool": "reticle_look", "args": {...} }, ...]
// Prints "=== N <tool> ===" + result text (or error) per step. Sync writes only.
import { spawn } from 'child_process';
import { readFileSync, writeSync } from 'fs';

const steps = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const CAP = parseInt(process.env.MCP_CAP || '6000', 10);

const child = spawn('npx', ['--yes', '@reticlehq/server@latest', 'mcp', '--port', '4400'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
});

let buf = '';
const pending = new Map();
let nextId = 1;

child.stdout.on('data', (d) => {
  buf += d.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg = null;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg && msg.id !== undefined && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  }
});
child.stderr.on('data', (d) => {
  const s = d.toString();
  if (!s.includes('npm notice')) writeSync(2, s);
});

function request(method, params, timeoutMs = 90000) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, resolve);
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout waiting for ${method}`)); }
    }, timeoutMs);
  });
}

await request('initialize', {
  protocolVersion: '2024-11-05',
  capabilities: {},
  clientInfo: { name: 'buffy-drive', version: '1.0' },
});
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

for (let i = 0; i < steps.length; i++) {
  const { tool, args } = steps[i];
  writeSync(1, `\n=== step ${i + 1}: ${tool} ===\n`);
  try {
    const msg = await request('tools/call', { name: tool, arguments: args }, 100000);
    if (msg.error) { writeSync(1, `ERROR: ${JSON.stringify(msg.error).slice(0, 1200)}\n`); continue; }
    const text = (msg.result?.content ?? []).map((c) => c.text).join('\n') || JSON.stringify(msg.result ?? {}).slice(0, 2000);
    writeSync(1, text.slice(0, CAP) + (text.length > CAP ? `\n[...truncated, ${text.length} chars]` : '') + '\n');
  } catch (e) {
    writeSync(1, `DRIVER ERROR: ${e.message}\n`);
  }
}

child.kill();
await new Promise((r) => setTimeout(r, 300));
