const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');

const blobs = new Map();
let revision = 0;
const fakeBlobsStore = {
  async get(key) {
    const entry = blobs.get(key);
    return entry ? structuredClone(entry.value) : null;
  },
  async getMetadata(key) {
    const entry = blobs.get(key);
    return entry ? { etag: entry.etag } : null;
  },
  async list({ prefix }) {
    return { blobs: [...blobs.keys()].filter(key => key.startsWith(prefix)).map(key => ({ key })) };
  },
  async setJSON(key, value, options = {}) {
    const current = blobs.get(key);
    if (options.onlyIfNew && current) return { modified: false };
    if (options.onlyIfMatch && current?.etag !== options.onlyIfMatch) return { modified: false };
    blobs.set(key, { value: structuredClone(value), etag: String(++revision) });
    return { modified: true };
  }
};

let source = stripTypeScriptTypes(fs.readFileSync('netlify/functions/game.ts', 'utf8'));
source = source
  .replace(/import \{ getStore \} from "@netlify\/blobs";/, 'const getStore = () => fakeBlobsStore;')
  .replace(/import core from "\.\.\/lib\/game-core\.cjs";/, 'const core = require("../netlify/lib/game-core.cjs");')
  .replace(/export default async \(request\s*\) => \{/, 'module.exports = async (request) => {');

const handlerModule = { exports: {} };
vm.runInNewContext(source, {
  module: handlerModule, require, fakeBlobsStore, Request, Response, console, Date, Math,
  String, Number, Promise, JSON, Error
}, { filename: 'netlify/functions/game.ts' });

async function call(action, payload = {}, authToken = '', roomCode = '') {
  const response = await handlerModule.exports(new Request('http://localhost/.netlify/functions/game', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action, payload, authToken, roomCode })
  }));
  return { status: response.status, data: await response.json() };
}

(async () => {
  const invalidMethod = await handlerModule.exports(new Request('http://localhost/.netlify/functions/game'));
  assert.equal(invalidMethod.status, 405);

  const created = await call('create_room', { name: 'Host', difficulty: 'normal', rounds: 3 }, 'host-token');
  assert.equal(created.status, 200);
  assert.ok(created.data.roomCode);
  assert.ok(created.data.authToken);

  const joined = await call('join_room', { name: 'Guest', characterId: 'm2' }, 'guest-token', created.data.roomCode);
  assert.equal(joined.status, 200);
  assert.ok(joined.data.playerId);

  const room = await call('poll', {}, created.data.authToken, created.data.roomCode);
  assert.equal(room.status, 200);
  assert.equal(room.data.room.players.length, 2);
  assert.deepEqual(room.data.room.players.map(player => player.displayName), ['Host', 'Guest']);

  const started = await call('start_game', {}, created.data.authToken, created.data.roomCode);
  assert.equal(started.status, 200);
  const startedRoom = await call('poll', {}, created.data.authToken, created.data.roomCode);
  assert.equal(startedRoom.data.room.phase, 'briefing');
  console.log('Passed: Netlify function method handling, room creation, two-player join, state polling, and game start with conditional Blobs writes.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
