const assert = require('node:assert/strict');
const core = require('../netlify/lib/game-core.cjs');

let now = 100000;
const host = core.createRoom({ name: 'Host', difficulty: 'normal', rounds: 3, openToPlayers: true }, now);
const hostToken = host.players[0].token;
const guestToken = 'guest-test-token';
let response = core.apply(host, guestToken, 'join_room', { name: 'Guest', characterId: 'm2' }, now);
assert.equal(response.error, undefined);
const guest = host.players.find(player => player.token === guestToken);
assert.ok(guest, 'second player joins using a separate client identity');

core.apply(host, hostToken, 'start_game', {}, now);
assert.equal(host.phase, 'briefing');
assert.equal(host.briefingEndsAt - now, 10000, 'the pre-round briefing lasts ten seconds');
const firstBriefingEnd = host.briefingEndsAt;
core.apply(host, hostToken, 'start_game', {}, now + 1);
assert.equal(host.briefingEndsAt, firstBriefingEnd, 'duplicate start requests cannot restart a match');

for (let round = 1; round <= 3; round++) {
  now = host.briefingEndsAt + 1;
  core.apply(host, hostToken, 'poll', {}, now);
  core.apply(host, guestToken, 'poll', {}, now);
  assert.equal(host.phase, 'playing', 'the first turn starts when the ten-second countdown ends');
  const losingPlayer = host.players.find(player => player.id === host.currentPlayerId);
  const loserToken = losingPlayer.token;
  now = host.turnEndsAt + 251;
  core.apply(host, loserToken, 'poll', {}, now);
  assert.equal(host.phase, 'round_end');
  assert.equal(host.round, round);
  assert.equal(host.players.reduce((sum, player) => sum + player.score, 0), round, 'one point is awarded per round');
  now = host.roundTransitionEndsAt + 1;
  core.apply(host, hostToken, 'poll', {}, now);
  if (round < 3) assert.equal(host.phase, 'briefing');
}

assert.equal(host.phase, 'match_end');
assert.equal(host.winnerIds.length, 1);
assert.equal(host.players.find(player => player.id === host.winnerIds[0]).score, 3);

// A disconnected non-current player must not steal the current player's turn.
now = 500000;
const seats = core.createRoom({ name: 'Seat 1', difficulty: 'normal', rounds: 3 }, now);
const [seat1, seat2, seat3] = ['Seat 2', 'Seat 3', 'Seat 4'].map((name, i) => {
  const token = `seat-token-${i}`;
  core.apply(seats, token, 'join_room', { name, characterId: `m${i + 2}` }, now);
  return seats.players.find(player => player.token === token);
});
const seat1Token = seats.players[0].token;
core.apply(seats, seat1Token, 'start_game', {}, now);
now = seats.briefingEndsAt + 1;
core.apply(seats, seat1Token, 'poll', {}, now);
assert.equal(seats.phase, 'playing');
assert.equal(seats.currentPlayerId, seats.players[0].id);
seat1.lastSeenAt = now - 50000;
seat1.connected = true;
now++;
core.apply(seats, seat3.token, 'poll', {}, now);
assert.equal(seats.currentPlayerId, seats.players[0].id, 'a non-current disconnect leaves the active turn alone');
seats.players[0].lastSeenAt = now - 50000;
now++;
core.apply(seats, seat3.token, 'poll', {}, now);
assert.equal(seats.currentPlayerId, seat2.id, 'turn rotation follows the seating order after the current player disconnects');

// A disconnect during the results screen must not restart the round.
now = 700000;
const resultRoom = core.createRoom({ name: 'Result tester', difficulty: 'normal', rounds: 3 }, now);
const resultHostToken = resultRoom.players[0].token;
core.apply(resultRoom, 'result-guest', 'join_room', { name: 'Guest', characterId: 'm2' }, now);
core.apply(resultRoom, resultHostToken, 'start_game', {}, now);
now = resultRoom.briefingEndsAt + 1;
core.apply(resultRoom, resultHostToken, 'poll', {}, now);
assert.equal(resultRoom.phase, 'playing');
const roundLoser = resultRoom.players.find(player => player.id === resultRoom.currentPlayerId);
now = resultRoom.turnEndsAt + 251;
core.apply(resultRoom, roundLoser.token, 'poll', {}, now);
assert.equal(resultRoom.phase, 'round_end');
const roundWinner = resultRoom.players.find(player => player.alive);
roundWinner.lastSeenAt = now - 50000;
now++;
core.apply(resultRoom, roundLoser.token, 'poll', {}, now);
assert.equal(resultRoom.phase, 'round_end', 'disconnects during round results preserve the results phase');

// Numeric entries included in a category must pass the same runtime validator.
now = 900000;
const numericRoom = core.createRoom({ name: 'Word tester', difficulty: 'normal', rounds: 3 }, now);
const numericToken = numericRoom.players[0].token;
core.apply(numericRoom, 'numeric-guest', 'join_room', { name: 'Guest', characterId: 'm2' }, now);
core.apply(numericRoom, numericToken, 'start_game', {}, now);
numericRoom.phase = 'playing';
numericRoom.category = 'Technology';
numericRoom.forbiddenLetters = ['Q', 'X', 'Z'];
numericRoom.currentPlayerId = numericRoom.players[0].id;
numericRoom.turnEndsAt = now + 10000;
core.apply(numericRoom, numericToken, 'submit_word', { word: '3D printer' }, now + 1);
assert.equal(numericRoom.usedWords[0]?.word, '3d printer', 'category-listed numeric words are accepted');

console.log('Passed: match flow, scoring, winner selection, disconnect turn order, result-phase stability, and numeric category words.');
