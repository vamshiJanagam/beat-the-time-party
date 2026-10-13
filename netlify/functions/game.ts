import { getStore } from "@netlify/blobs";
import core from "../lib/game-core.cjs";

const store = getStore("beat-the-time-rooms");
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const keyFor = (code: string) => `rooms/${code}`;
async function readRoom(code: string) {
  const key = keyFor(code);
  const [room, meta] = await Promise.all([
    store.get(key, { consistency: "strong", type: "json" }) as Promise<any>,
    store.getMetadata(key, { consistency: "strong" })
  ]);
  return room && meta ? { room, etag: meta.etag } : null;
}
async function allRooms() {
  const { blobs } = await store.list({ prefix: "rooms/" });
  const entries = await Promise.all(blobs.map(async (blob: { key: string }) => {
    const result = await readRoom(blob.key.slice("rooms/".length));
    return result?.room || null;
  }));
  return entries.filter(Boolean);
}
async function updateRoom(code: string, mutate: (room: any) => any) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const current = await readRoom(code);
    if (!current) return { missing: true };
    const result = mutate(current.room);
    const saved = await store.setJSON(keyFor(code), current.room, { onlyIfMatch: current.etag });
    if (saved.modified) return { room: current.room, result };
  }
  throw new Error("Room is busy. Please try again.");
}
async function findByPublicId(publicId: string) {
  if (!publicId) return null;
  const rooms = await allRooms();
  return rooms.find((room: any) => room.publicId === publicId) || null;
}

export default async (request: Request) => {
  if (request.method !== "POST") return json({ error: "Use POST for game actions." }, 405);
  let input: any;
  try { input = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  const action = String(input?.action || "");
  const payload = input?.payload && typeof input.payload === "object" ? input.payload : {};
  const now = Date.now();
  try {
    if (action === "get_available_rooms") {
      return json({ events: [{ event: "available_rooms", data: core.availableRooms(await allRooms(), now) }] });
    }
    if (action === "create_room") {
      const room = core.createRoom(payload, now);
      const saved = await store.setJSON(keyFor(room.code), room, { onlyIfNew: true });
      if (!saved.modified) return json({ events: [{ event: "join_error", data: { message: "Could not create a room. Please try again." } }] }, 503);
      return json({ roomCode: room.code, playerId: room.hostId, authToken: room.players[0].token, events: [{ event: "room_created", data: { roomCode: room.code, playerId: room.hostId } }] });
    }
    if (action === "request_public_join") {
      const room = await findByPublicId(String(payload.roomId || ""));
      if (!room) return json({ events: [{ event: "public_join_request_error", data: { message: "That room is no longer available. Choose another room." } }] });
      const token = String(input.authToken || "");
      const updated = await updateRoom(room.code, r => core.apply(r, token, action, payload, now));
      if (updated.missing) return json({ events: [{ event: "public_join_request_error", data: { message: "That room is no longer available. Choose another room." } }] });
      return json({ roomCode: room.code, authToken: token, events: updated.result?.error ? [updated.result.error] : core.eventsFor(updated.room, token, 0) });
    }
    const code = String(input.roomCode || payload.roomCode || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(code)) return json({ events: [{ event: "join_error", data: { message: "Enter a valid room code." } }] });
    if (action === "join_room") {
      const room = await readRoom(code);
      if (!room) return json({ events: [{ event: "join_error", data: { message: "ROOM NOT FOUND" } }] });
      const token = String(input.authToken || "");
      const updated = await updateRoom(code, r => core.apply(r, token, action, payload, now));
      if (updated.missing) return json({ events: [{ event: "join_error", data: { message: "ROOM NOT FOUND" } }] });
      if (updated.result?.error) return json({ events: [updated.result.error] });
      const p = updated.room.players.find((player: any) => player.token === token);
      return json({ roomCode: code, playerId: p?.id, authToken: token, events: [{ event: "joined_room", data: { roomCode: code, playerId: p?.id } }] });
    }
    if (action === "poll") {
      const token = String(input.authToken || "");
      const updated = await updateRoom(code, r => { core.apply(r, token, "poll", {}, now); return null; });
      if (updated.missing) return json({ room: null, events: [] });
      const player = updated.room.players.find((p: any) => p.token === token);
      const ownsRequest = updated.room.joinRequests.some((q: any) => q.token === token) || updated.room.events.some((e: any) => e.audience === token);
      if (!player && !ownsRequest) return json({ room: null, events: [] });
      const events = core.eventsFor(updated.room, token, Number(input.afterEvent || 0));
      const host = player?.id === updated.room.hostId;
      if (host) events.push({ id: `pending-${updated.room.updatedAt}`, event: "pending_join_requests", data: updated.room.joinRequests.map(({ requestId, name, characterId }: any) => ({ requestId, name, characterId })) });
      return json({ room: player ? core.serialize(updated.room, token) : null, events, eventCursor: updated.room.nextEventSeq || 0 });
    }
    const token = String(input.authToken || "");
    const updated = await updateRoom(code, r => core.apply(r, token, action, payload, now));
    if (updated.missing) return json({ events: [{ event: "join_error", data: { message: "ROOM NOT FOUND" } }] });
    if (updated.result?.error) return json({ events: [updated.result.error] });
    return json({ roomCode: code, authToken: token, events: core.eventsFor(updated.room, token, Number.MAX_SAFE_INTEGER) });
  } catch (error) {
    console.error("Game request failed", error);
    return json({ error: "The game service is busy. Please try again." }, 503);
  }
};
