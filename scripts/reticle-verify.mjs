// One-shot MCP stdio client for the Reticle daemon.
// Usage:
//   node scripts/reticle-verify.mjs list
//   node scripts/reticle-verify.mjs verify <url> '<intent statement>' '<expect json>'
import { spawn } from 'child_process';

const mode = process.argv[2];
const url = process.argv[3];
const intentStatement = process.argv[4];
const expectJson = process.argv[5];

const child = spawn('npx', ['--yes', '@reticlehq/server@latest', 'mcp', '--port', '4400'], {
  cwd: new URL('..', 'file://' + process.cwd().replace(/\\/g, '/')).pathname.replace(/^\/(C:)/, '$1'),
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
    try {
      const msg = JSON.parse(line);
      if (msg.id !== undefined && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    } catch { /* non-JSON line */ }
  }
});

child.stderr.on('data', (d) => process.stderr.write(d));

function request(method, params, timeoutMs = 120000) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, (msg) => resolve(msg));
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout waiting for ${method}`)); }
    }, timeoutMs);
  });
}

await request('initialize', {
  protocolVersion: '2024-11-05',
  capabilities: {},
  clientInfo: { name: 'buffy-reticle-script', version: '1.0' },
});
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

const toolsMsg = await request('tools/list', {});
const tools = toolsMsg.result?.tools ?? [];
if (mode === 'list') {
  for (const t of tools) {
    const props = t.inputSchema?.properties ? Object.keys(t.inputSchema.properties).join(',') : '';
    console.log(`- ${t.name} (${props})`);
  }
  child.kill();
  process.exit(0);
}

async function call(name, args) {
  const msg = await request('tools/call', { name, arguments: args });
  const text = msg.result?.content?.map((c) => c.text).join('\n') ?? JSON.stringify(msg.result ?? msg.error);
  console.log(`\n=== ${name} ===\n${text.slice(0, 60000)}`);
  return text;
}

if (mode === 'call') {
  const toolName = process.argv[3];
  const args = JSON.parse(process.argv[4] || '{}');
  await call(toolName, args);
  child.kill();
  process.exit(0);
}

if (intentStatement) {
  await call('reticle_intent', {
    action: 'declare',
    intents: [{ id: 'president-updates-oct2026', statement: intentStatement }],
  });
}

const expect = JSON.parse(expectJson);
await call('reticle_verify', { url, expect });

child.kill();
process.exit(0);
