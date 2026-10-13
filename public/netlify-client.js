(() => {
  const listeners = new Map();
  const storage = window.sessionStorage;
  const read = (key, fallback = '') => { try { return storage.getItem(`btt:${key}`) || fallback; } catch { return fallback; } };
  const write = (key, value) => { try { if (value) storage.setItem(`btt:${key}`, String(value)); else storage.removeItem(`btt:${key}`); } catch {} };
  const freshToken = () => crypto.randomUUID().replaceAll('-', '');
  let token = read('token') || freshToken();
  let roomCode = read('roomCode');
  let eventCursor = Number(read('eventCursor', '0')) || 0;
  let lastRoomState = '';
  let requestBusy = false;
  write('token', token);
  const dispatch = (event, data) => { for (const callback of listeners.get(event) || []) { try { callback(data); } catch (error) { console.error(error); } } };
  async function call(body) {
    const response = await fetch('/.netlify/functions/game', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The game service is temporarily unavailable.');
    return data;
  }
  function remember(data) {
    if (data.authToken) { token = data.authToken; write('token', token); }
    if (data.roomCode) { roomCode = data.roomCode; write('roomCode', roomCode); }
    for (const item of data.events || []) dispatch(item.event, item.data);
  }
  const socket = {
    on(event, callback) { const set = listeners.get(event) || new Set(); set.add(callback); listeners.set(event, set); return socket; },
    off(event, callback) { listeners.get(event)?.delete(callback); return socket; },
    emit(action, payload = {}) {
      if (action === 'create_room' || action === 'join_room') { token = freshToken(); roomCode = action === 'join_room' ? String(payload.roomCode || '').trim().toUpperCase() : ''; eventCursor = 0; lastRoomState = ''; write('token', token); write('roomCode', roomCode); write('eventCursor', '0'); }
      const body = { action, payload, authToken: token, roomCode: action === 'request_public_join' ? '' : roomCode };
      call(body).then(data => { remember(data); if (action === 'create_room' || action === 'join_room' || action === 'request_public_join') { eventCursor = 0; write('eventCursor', '0'); } if (action === 'leave_room') { roomCode = ''; eventCursor = 0; lastRoomState = ''; write('roomCode', ''); write('eventCursor', '0'); dispatch('left_room', {}); } }).catch(error => dispatch(action === 'create_room' || action === 'join_room' ? 'join_error' : 'game_event', action === 'create_room' || action === 'join_room' ? { message: error.message } : { type: 'error', message: error.message }));
      return socket;
    }
  };
  window.io = () => socket;
  async function poll() {
    if (requestBusy) return;
    requestBusy = true;
    try {
      if (roomCode) {
        const data = await call({ action: 'poll', authToken: token, roomCode, afterEvent: eventCursor });
        if (data.room) {
          const serialized = JSON.stringify(data.room);
          if (serialized !== lastRoomState) { lastRoomState = serialized; dispatch('room_state', data.room); }
        }
        for (const item of data.events || []) {
          if (item.event === 'pending_join_requests' && item.id.startsWith('pending-')) dispatch(item.event, item.data);
          else { dispatch(item.event, item.data); const seq = Number(item.id); if (Number.isFinite(seq)) eventCursor = Math.max(eventCursor, seq); }
        }
        if (data.eventCursor) eventCursor = Math.max(eventCursor, Number(data.eventCursor));
        write('eventCursor', String(eventCursor));
      }
    } catch (error) { console.warn('Game sync paused:', error.message); }
    finally { requestBusy = false; }
  }
  async function refreshRooms() {
    try { const data = await call({ action: 'get_available_rooms' }); for (const item of data.events || []) dispatch(item.event, item.data); }
    catch (error) { console.warn('Room list refresh paused:', error.message); }
  }
  setInterval(poll, 800);
  setInterval(refreshRooms, 2500);
  poll();
})();
