const socket = io();
const AVATARS = [
  ['m1','Kai','male','blue','short'],['m2','Leo','male','orange','spiky'],['m3','Max','male','green','curly'],['m4','Arjun','male','purple','beard'],['m5','Noah','male','red','cap'],['m6','Ethan','male','teal','short'],
  ['f1','Mia','female','pink','long'],['f2','Zoe','female','blue','ponytail'],['f3','Ava','female','purple','bob'],['f4','Nina','female','green','curly'],['f5','Sara','female','orange','long'],['f6','Ivy','female','teal','ponytail']
];
const state = { mode:'create', characterId:'m1', room:null, sound:true, music:true, settingsOpen:false, lastPhase:null, timerInterval:null, transitionInterval:null, threeReady:false, musicBaseVolume:.30, finder:{name:'',rooms:[],pendingRoomId:null,status:''} };
let pendingJoinRequests=[];
let musicDuckTimer=null;
const $ = id => document.getElementById(id);

function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $(id).classList.add('active');
  requestAnimationFrame(()=>{
    if(id==='setupScreen') showCharacterPreview();
    if(!window.BeatTime3D) return;
    if(id==='gameScreen') {
      window.BeatTime3D.resize(document.getElementById('threeArena'));
      if(state.room) window.BeatTime3D.syncPlayers(document.getElementById('threeArena'), state.room.players);
    }
  });
}
function avatarData(id){ return AVATARS.find(x=>x[0]===id) || AVATARS[0]; }
function characterMarkup(id, compact=false){ const [key]=avatarData(id); return `<span class="character-model-portrait${compact?' compact':''}"><img data-character-model="${key}" alt="Cartoon character" /></span>`; }
function loadCharacterPortraits(root=document){
  if(!root||!window.BeatTimeAvatars)return;
  root.querySelectorAll('[data-character-model]').forEach(node=>{
    if(node.tagName==='CANVAS'&&node.dataset.drawn)return;
    const id=window.BeatTimeAvatars.styles[node.dataset.characterModel]?node.dataset.characterModel:'m1';
    const canvas=window.BeatTimeAvatars.canvas(id);canvas.className='character-inline-canvas';canvas.dataset.characterModel=id;canvas.dataset.drawn='true';canvas.setAttribute('aria-hidden','true');node.replaceWith(canvas);
  });
}
function showCharacterPreview(id=state.characterId){
  const stage=$('characterPreview3D');if(!stage||!window.BeatTimeAvatars)return null;
  const canvas=window.BeatTimeAvatars.canvas(id);canvas.className='character-preview-canvas';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Selected player avatar');stage.replaceChildren(canvas);return canvas;
}
function escapeHTML(value){ return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function me(){ return state.room?.players.find(p=>p.isMe); }
function host(){ return state.room?.players.find(p=>p.isHost); }
function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2200); }
let audioContext=null;
function getAudioContext(){ const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; if(!audioContext) audioContext=new C(); if(audioContext.state==='suspended') audioContext.resume(); return audioContext; }
function duckMusic(){ const a=$('bgMusic'); if(!a || !state.music) return; clearTimeout(musicDuckTimer); clearInterval(a._duckFade); const base=state.musicBaseVolume; const down=Math.max(.08,base*.34); const start=a.volume; const started=performance.now(); a._duckFade=setInterval(()=>{ const p=Math.min(1,(performance.now()-started)/140); a.volume=start+(down-start)*p; if(p>=1) clearInterval(a._duckFade); },16); musicDuckTimer=setTimeout(()=>{ if(state.music && !a.paused){ clearInterval(a._duckFade); const from=a.volume; const started2=performance.now(); a._duckFade=setInterval(()=>{ const p=Math.min(1,(performance.now()-started2)/260); a.volume=from+(base-from)*p; if(p>=1) clearInterval(a._duckFade); },16); } },1050); }
function beep(type){
  if(!state.sound) return;
  if(['warning3','warning2','warning1','timeout'].includes(type)) duckMusic();
  try{
    const c=getAudioContext(); if(!c) return;
    const o=c.createOscillator(),g=c.createGain();
    const map={
      ok:[660,.10,'sine',.10],
      bad:[150,.18,'sawtooth',.11],
      duplicate:[260,.20,'triangle',.11],
      forbidden:[210,.28,'square',.10],
      warning3:[560,.16,'sine',.09],
      warning2:[440,.18,'sine',.10],
      warning1:[330,.24,'sine',.12],
      timeout:[115,.55,'sawtooth',.13],
      win:[880,.28,'sine',.12],
      join:[520,.08,'sine',.08]
    };
    const [f,d,w,volume]=map[type]||map.warning1;
    const now=c.currentTime; o.type=w; o.frequency.setValueAtTime(f,now);
    g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(volume,now+.015); g.gain.exponentialRampToValueAtTime(.0001,now+d);
    o.connect(g); g.connect(c.destination); o.start(now); o.stop(now+d+.03);
  }catch(e){}
}

function renderAvatars(){
  const grid=$('avatarGrid'); if(!grid) return; grid.innerHTML='';
  const taken=new Set((state.room?.players||[]).filter(p=>!p.isMe).map(p=>p.characterId));
  const selectedIndex=Math.max(0,AVATARS.findIndex(x=>x[0]===state.characterId))+1;
  if($('characterCount')) $('characterCount').textContent=`${selectedIndex} / ${AVATARS.length}`;
  AVATARS.forEach(([id,,gender],index)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='avatar-option avatar-option-v2'+(state.characterId===id?' selected':'')+(taken.has(id)?' taken':'');
    b.setAttribute('aria-label',`Avatar ${index+1}, ${gender}${taken.has(id)?', taken':''}`);
    const label=state.characterId===id?$('nameInput')?.value.trim()||'':'';
    b.innerHTML=`<span class="avatar-thumb">${characterMarkup(id,true)}</span><span class="avatar-meta"><strong data-character-label>${escapeHTML(label)}</strong><small>${taken.has(id)?'TAKEN':gender==='female'?'FEMALE':'MALE'}</small></span>${state.characterId===id?'<span class="avatar-check">✓</span>':''}`;
    b.disabled=taken.has(id);
    b.onclick=()=>{
      state.characterId=id; renderAvatars();
      updateSelectedCharacterName();
      requestAnimationFrame(()=>showCharacterPreview(id));
      if(state.room) socket.emit('update_character',{characterId:id});
    };
    grid.appendChild(b);
  });
  loadCharacterPortraits(grid);
  updateSelectedCharacterName();
}

function updateSelectedCharacterName(){
  const name=$('nameInput')?.value.trim()||'';
  if($('selectedCharacterName')) $('selectedCharacterName').textContent=name.toUpperCase();
  const selected=$('avatarGrid')?.querySelector('.avatar-option.selected [data-character-label]');
  if(selected) selected.textContent=name.toUpperCase();
}

function init3DLayer(){
  if(!window.BeatTime3D) return false;
  try{
    BeatTime3D.init(document.getElementById('threeArena'));
    state.threeReady=true;
    loadCharacterPortraits(document);
    document.body.classList.remove('three-failed');
    requestAnimationFrame(()=>{
      const preview=document.getElementById('characterPreview3D');
      if(preview && document.getElementById('setupScreen')?.classList.contains('active')) showCharacterPreview(state.characterId);
      if(state.room && ['playing','countdown','briefing'].includes(state.room.phase)) BeatTime3D.syncPlayers(document.getElementById('threeArena'),state.room.players);
      BeatTime3D.resize(document.getElementById('threeArena'));
    });
    return true;
  }catch(err){
    console.error('BEAT THE TIME: 3D scene initialization failed.', err);
    return false;
  }
}
window.addEventListener('beat-time-3d-ready', init3DLayer, {once:true});
window.addEventListener('beat-time-3d-failed', (event)=>{
  console.error('BEAT THE TIME: 3D renderer could not load.', event.detail);
  document.body.classList.add('three-failed');
}, {once:true});
if(window.BeatTime3D) init3DLayer();
const threePoll=setInterval(()=>{
  if(window.BeatTime3D){
    clearInterval(threePoll);
    if(!state.threeReady) init3DLayer();
  }
},100);
setTimeout(()=>{
  clearInterval(threePoll);
  if(!state.threeReady && !window.BeatTime3D) document.body.classList.add('three-failed');
},6500);

 $('createBtn').onclick=()=>{state.mode='create';$('setupEyebrow').textContent='CREATE A ROOM';$('setupTitle').textContent='Build your table.';$('setupSubtitle').textContent='Enter a name, choose a look, and get a seat ready.';$('setupAction').textContent='CREATE ROOM';$('roomCodeWrap').classList.add('hidden');$('hostSettings').classList.remove('hidden');$('setupError').textContent='';document.querySelector('input[name="roomVisibility"][value="private"]').checked=true;show('setupScreen');renderAvatars();};
$('joinBtn').onclick=()=>{state.mode='join';$('setupEyebrow').textContent='JOIN A ROOM';$('setupTitle').textContent='Take your seat.';$('setupSubtitle').textContent='Enter your name and the 5-letter room code from the host.';$('setupAction').textContent='JOIN ROOM';$('roomCodeWrap').classList.remove('hidden');$('hostSettings').classList.add('hidden');$('setupError').textContent='';show('setupScreen');renderAvatars();$('roomCodeInput').focus();};
document.getElementById('findGameBtn').onclick=()=>{
  state.mode='find';$('setupEyebrow').textContent='FIND A GAME';$('setupTitle').textContent='Find your table.';$('setupSubtitle').textContent='Enter your name to browse open rooms.';$('setupAction').textContent='FIND AVAILABLE ROOMS';
  $('roomCodeWrap').classList.add('hidden');$('hostSettings').classList.add('hidden');$('setupError').textContent='';show('setupScreen');renderAvatars();
};
document.querySelector('[data-back]').onclick=()=>show('homeScreen');
$('nameInput').addEventListener('input',updateSelectedCharacterName);
$('setupAction').onclick=()=>{
  const name=$('nameInput').value.trim(); if(!name){$('setupError').textContent='Enter a name first.';return;}
  if(state.mode==='find'){
    state.finder.name=name;state.finder.pendingRoomId=null;state.finder.status='';
    show('findRoomsScreen');renderAvailableRooms();socket.emit('get_available_rooms');
  }else if(state.mode==='create') socket.emit('create_room',{name,characterId:state.characterId,difficulty:$('difficultySelect').value,rounds:Number($('roundsSelect').value),openToPlayers:document.querySelector('input[name="roomVisibility"]:checked')?.value==='open'});
  else {const code=$('roomCodeInput').value.trim().toUpperCase(); if(code.length!==5){$('setupError').textContent='Enter the 5-letter room code.';return;} socket.emit('join_room',{roomCode:code,name,characterId:state.characterId});}
};
$('findRoomsBack').onclick=()=>{show('setupScreen');};
$('refreshRoomsBtn').onclick=()=>socket.emit('get_available_rooms');
$('copyCode').onclick=async()=>{try{await navigator.clipboard.writeText(state.room.code);toast('ROOM CODE COPIED');}catch(e){toast(state.room.code)}};
$('startBtn').onclick=()=>socket.emit('start_game');
function updateAudioButtons(){
  if($('soundBtn')) $('soundBtn').textContent=state.sound?'🔊':'🔇';
  if($('homeSoundBtn')) $('homeSoundBtn').textContent=state.sound?'🔊':'🔇';
  if($('musicBtn')) $('musicBtn').textContent=state.music?'🎵':'🔇';
  if($('settingsSoundBtn')) $('settingsSoundBtn').innerHTML=`<span>Sound effects</span><strong>${state.sound?'ON':'OFF'}</strong>`;
  if($('settingsMusicBtn')) $('settingsMusicBtn').innerHTML=`<span>Background music</span><strong>${state.music?'ON':'OFF'}</strong>`;
}
function startMusic(){
  const a=$('bgMusic'); if(!a || !state.music) return;
  if(a.paused){ a.volume=state.musicBaseVolume; const p=a.play(); if(p&&p.catch) p.catch(()=>{}); }
}
function stopMusic(){ const a=$('bgMusic'); if(a){clearTimeout(musicDuckTimer); a.pause();} }
const bgMusic=$('bgMusic');
if(bgMusic){
  bgMusic.volume=state.musicBaseVolume;
  bgMusic.addEventListener('error',()=>{ console.warn('Background music playback error; retrying.'); });
}
$('soundBtn').onclick=()=>{state.sound=!state.sound;updateAudioButtons();getAudioContext();};
$('musicBtn').onclick=()=>{state.music=!state.music;updateAudioButtons();if(state.music) startMusic(); else stopMusic();};
$('homeSoundBtn').onclick=()=>{state.sound=!state.sound;updateAudioButtons();getAudioContext();};
document.addEventListener('pointerdown',()=>{ if(state.music) startMusic(); },{passive:true});
updateAudioButtons();
$('homeSettingsBtn').onclick=()=>toast('Game settings are chosen when you create a room.');
$('settingsBtn').onclick=()=>{state.settingsOpen=true;renderGameSettings();};
$('closeGameSettings').onclick=()=>{if(state.room?.paused)return;state.settingsOpen=false;renderGameSettings();};
$('settingsSoundBtn').onclick=()=>{state.sound=!state.sound;updateAudioButtons();getAudioContext();};
$('settingsMusicBtn').onclick=()=>{state.music=!state.music;updateAudioButtons();if(state.music)startMusic();else stopMusic();};
$('pauseGameBtn').onclick=()=>{if(!me()?.isHost)return;if(state.room?.paused){socket.emit('resume_game');state.settingsOpen=false;}else{state.settingsOpen=true;socket.emit('pause_game');}renderGameSettings();};
$('exitGameBtn').onclick=()=>{if(!confirm('Leave this game? You will return to the home screen.'))return;$('exitGameBtn').disabled=true;socket.emit('leave_room');};
socket.on('left_room',()=>{state.room=null;state.settingsOpen=false;$('exitGameBtn').disabled=false;show('homeScreen');});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.settingsOpen&&!state.room?.paused){state.settingsOpen=false;renderGameSettings();}});
$('answerInput').addEventListener('keydown',e=>{if(e.key==='Enter') $('submitBtn').click()});
$('submitBtn').onclick=()=>{const v=$('answerInput').value.trim();if(!v)return;socket.emit('submit_word',{word:v});};
$('playAgainBtn').onclick=()=>socket.emit('play_again');
$('continueRoundBtn').onclick=()=>socket.emit('continue_round');
document.querySelectorAll('#reactionBar [data-reaction]').forEach(btn=>btn.onclick=()=>socket.emit('reaction',{reaction:btn.dataset.reaction}));
socket.on('reaction', d=>showReaction(d));
$('newRoomBtn').onclick=()=>location.reload();

$('lobbyOpenToPlayers').addEventListener('change',event=>socket.emit('set_room_visibility',{open:event.target.checked}));
$('pendingJoinRequestList').addEventListener('click',event=>{
  const button=event.target.closest('[data-request-action]');if(!button||!state.room)return;
  socket.emit('respond_join_request',{roomId:state.room.publicId,requestId:button.dataset.requestId,accept:button.dataset.requestAction==='accept'});
});
$('availableRoomsList').addEventListener('click',event=>{
  const button=event.target.closest('[data-request-room]');if(!button||state.finder.pendingRoomId)return;
  state.finder.pendingRoomId=button.dataset.requestRoom;state.finder.status='Waiting for host approval.';renderAvailableRooms();
  socket.emit('request_public_join',{roomId:state.finder.pendingRoomId,name:state.finder.name,characterId:state.characterId});
});

socket.on('room_created',d=>{toast(`ROOM ${d.roomCode} CREATED`)});
socket.on('joined_room',()=>toast('YOU JOINED THE TABLE'));
socket.on('join_error',d=>{$('setupError').textContent=d.message;beep('bad')});
socket.on('available_rooms',rooms=>{state.finder.rooms=Array.isArray(rooms)?rooms:[];renderAvailableRooms();});
socket.on('public_join_pending',()=>{state.finder.status='Waiting for host approval.';renderAvailableRooms();});
socket.on('public_join_request_error',d=>{state.finder.pendingRoomId=null;state.finder.status=d.message||'Could not request this room.';renderAvailableRooms(true);});
socket.on('public_join_result',result=>{
  state.finder.pendingRoomId=null;state.finder.status=result?.message||'This room is no longer available.';renderAvailableRooms(result?.status!=='declined');
});
socket.on('pending_join_requests',requests=>{pendingJoinRequests=Array.isArray(requests)?requests:[];renderPendingJoinRequests();});
socket.on('word_rejected',d=>{toast(d.reason);beep(d.kind==='duplicate'?'duplicate':d.kind==='forbidden'?'forbidden':'bad');$('answerInput').focus();});
socket.on('game_event',d=>{
  if(d.type==='correct'){beep('ok');$('answerInput').value='';}
  if(d.type==='eliminated'){if(d.reason!=="TIME'S UP") beep('bad');toast(d.reason==='TIME\'S UP'?"TIME'S UP — YOU'RE OUT":"YOU'RE OUT");}
  if(d.type==='timeout'){beep('timeout');toast(`${d.displayName || 'Player'} — TIME'S UP`);}
  if(d.type==='error'){toast(d.message);beep('bad');}
});
socket.on('room_state',room=>{state.room=room; renderRoom();});

function showReaction(data){
  const layer=$('reactionLayer'); if(!layer) return;
  const el=document.createElement('div');
  el.className='floating-reaction';
  el.innerHTML=`<span>${escapeHTML(data.reaction)}</span><small>${escapeHTML(data.displayName)}</small>`;
  const seed=(String(data.playerId||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0)%60)+20;
  el.style.left=seed+'%';
  layer.appendChild(el);
  setTimeout(()=>el.remove(),1800);
}

function renderRoom(){
  const room=state.room; if(!room)return;
  if(room.phase==='lobby'){show('lobbyScreen');renderLobby();return;}
  if(['playing','countdown','briefing'].includes(room.phase)) {if(room.paused)state.settingsOpen=true;else if(state.roomWasPaused)state.settingsOpen=false;state.roomWasPaused=!!room.paused;show('gameScreen');renderGame();if(state.music) startMusic();return;}
  if(room.phase==='round_end'||room.phase==='match_end'){show('resultsScreen');renderResults();stopMusic();return;}
}
function renderLobby(){
  const room=state.room;$('lobbyCode').textContent=room.code;
  $('lobbyPlayers').innerHTML=room.players.map(p=>`<div class="lobby-player"><span class="host-badge">${p.isHost?'👑 HOST':''}</span><div class="avatar">${characterMarkup(p.characterId,true)}</div><div class="name">${escapeHTML(p.displayName)}</div><small>${p.isMe?'YOU':''}</small></div>`).join('');
  loadCharacterPortraits($('lobbyPlayers'));
  const h=host(); const isHost=me()?.isHost; $('startBtn').disabled=!isHost||room.players.length<2;
  $('startBtn').textContent=room.players.length<2?'WAITING FOR 2+ PLAYERS':'START GAME';
  $('settingsSummary').innerHTML=`<b>SETTINGS</b><br>Category: RANDOM EACH ROUND<br>Difficulty: ${room.difficulty.toUpperCase()}<br>Rounds: ${room.totalRounds}<br>Players: ${room.players.length}/8`;
  $('publicRoomControls').classList.toggle('hidden',!isHost);
  $('lobbyOpenToPlayers').checked=!!room.openToPlayers;
  renderPendingJoinRequests();
  if(h) $('lobbyError').textContent=isHost?'':'Host controls the start.';
}

function renderAvailableRooms(isError=false){
  const list=$('availableRoomsList');if(!list)return;
  $('publicJoinStatus').textContent=state.finder.status;
  $('publicJoinStatus').classList.toggle('error',isError);
  list.innerHTML=state.finder.rooms.map(room=>`<article class="available-room-card"><div class="available-room-info"><strong>${escapeHTML(room.roomName)}</strong><small>${room.players} / ${room.maxPlayers} players</small></div><button class="primary" data-request-room="${escapeHTML(room.id)}" ${state.finder.pendingRoomId?'disabled':''}>${state.finder.pendingRoomId===room.id?'REQUEST SENT':'REQUEST TO JOIN'}</button></article>`).join('');
  $('availableRoomsEmpty').classList.toggle('visible',state.finder.rooms.length===0);
  if(state.finder.pendingRoomId)$('availableRoomsEmpty').classList.remove('visible');
}

function renderPendingJoinRequests(){
  const panel=$('pendingJoinRequests');if(!panel)return;
  const isHost=me()?.isHost;panel.classList.toggle('hidden',!isHost||pendingJoinRequests.length===0);
  $('pendingJoinRequestList').innerHTML=pendingJoinRequests.map(request=>`<div class="join-request-card"><div class="join-request-avatar">${characterMarkup(request.characterId,true)}</div><strong>${escapeHTML(request.name)}</strong><div class="join-request-actions"><button data-request-action="decline" data-request-id="${escapeHTML(request.requestId)}">Decline</button><button class="accept-request" data-request-action="accept" data-request-id="${escapeHTML(request.requestId)}" ${state.room?.players.length>=8?'disabled':''}>Accept</button></div></div>`).join('');
  loadCharacterPortraits($('pendingJoinRequestList'));
}

function renderGame(){
  const room=state.room; const my=me();
  $('roundText').textContent=`${room.round||1} / ${room.totalRounds}`;
  $('categoryName').textContent=room.category.toUpperCase();
  $('forbiddenLetters').innerHTML=room.forbiddenLetters.map(l=>`<span>${l}</span>`).join('');
  const briefing=room.phase==='briefing';
  $('briefingPanel').classList.toggle('hidden',!briefing);
  $('categoryName').closest('.center-console').classList.toggle('hidden',briefing);
  if(briefing){
    $('briefingRound').textContent=`ROUND ${room.round} OF ${room.totalRounds}`;
    $('briefingCategory').textContent=room.category.toUpperCase();
    $('briefingLetters').innerHTML=room.forbiddenLetters.map(l=>`<span>${escapeHTML(l)}</span>`).join('');
    $('briefingPlayers').innerHTML=room.players.map(p=>`<div class="briefing-player${p.isMe?' is-me':''}">${characterMarkup(p.characterId,true)}<strong>${escapeHTML(p.displayName)}${p.isMe?' · YOU':''}</strong></div>`).join('');
    loadCharacterPortraits($('briefingPlayers'));
  }
  $('playerCount').textContent=`${room.players.filter(p=>p.connected).length} / 8`;
  $('usedWords').innerHTML=room.usedWords.slice().reverse().map(w=>`<div class="used-item"><div><b>${escapeHTML(w.word.toUpperCase())}</b><small>${escapeHTML(w.displayName)}</small></div></div>`).join('')||'<div class="muted">No words yet.</div>';
  $('feed').innerHTML=room.feed.slice().reverse().map(f=>`<div class="feed-item ${f.type==='correct'?'ok':f.type==='eliminated'?'bad':''}"><div>${f.type==='correct'?'✓':f.type==='eliminated'?'✕':'•'}</div><div>${escapeHTML(f.text)}</div></div>`).join('');
  window.__beatCurrentPlayerId = room.currentPlayerId;
  if (window.BeatTime3D) BeatTime3D.syncPlayers(document.getElementById('threeArena'), room.players);
  renderSeats(room);
  const current=room.players.find(p=>p.id===room.currentPlayerId); const active=!room.paused&&my?.id===room.currentPlayerId&&my?.alive&&room.phase==='playing';
  $('turnLabel').textContent=briefing?'READ THE BOARD':room.phase==='countdown'?'GET READY':current?`${current.displayName.toUpperCase()}${active?' — YOUR TURN':''}`:'GET READY';
  $('answerArea').style.opacity=active?'1':'.35'; $('answerInput').disabled=!active; $('submitBtn').disabled=!active;
  if(active && state.lastPhase!=='active'){setTimeout(()=>$('answerInput').focus(),50);}
  state.lastPhase=active?'active':room.phase;
  $('streakBox').innerHTML=`🔥 <b>${my?.streak||0}</b><span>STREAK</span>`;
  renderGameSettings();
  updateTimer(room);
}
function renderGameSettings(){
  const overlay=$('gameSettingsOverlay');if(!overlay)return;
  const paused=!!state.room?.paused, isHost=!!me()?.isHost;
  overlay.classList.toggle('hidden',!paused&&!state.settingsOpen);
  $('gameSettingsStatus').textContent=paused?(isHost?'Game paused for everyone. Resume when you’re ready.':'Game paused by the host.'):'Adjust audio, pause the match, or leave the game.';
  $('pauseGameBtn').textContent=paused?'RESUME GAME':'PAUSE GAME';
  $('pauseGameBtn').disabled=!isHost;
  $('pauseGameBtn').classList.toggle('hidden',!isHost);
  $('closeGameSettings').classList.toggle('hidden',paused);
  $('gameSettingsOverlay').classList.toggle('is-paused',paused);
  updateAudioButtons();
}
function renderSeats(room){
  const layer=$('playersLayer'); if(!layer)return;
  const players=room.players||[],count=players.length;
  layer.classList.toggle('crowded',count>=5);
  layer.innerHTML=players.map((p,index)=>{
    let left=50,top=72;
    if(count===2){left=index===0?25:75;top=56;}
    else if(count>2){
      const angle=Math.PI-(Math.PI*index/(count-1));
      const radiusX=count>=5?38:34;
      left=50+radiusX*Math.cos(angle);
      top=55+18*Math.sin(angle);
    }
    const active=p.id===room.currentPlayerId&&room.phase==='playing';
    return `<article class="player-game-card${p.isMe?' is-me':''}${active?' is-active':''}${p.alive===false?' is-out':''}" style="--card-left:${left}%;--card-top:${top}%">
      ${characterMarkup(p.characterId,true)}
      <strong class="game-card-name">${escapeHTML(p.displayName)}</strong>
      <small class="game-card-score">${p.score||0} ${p.score===1?'PT':'PTS'}${p.isMe?' · YOU':''}</small>
    </article>`;
  }).join('');
  loadCharacterPortraits(layer);
}

function updateTimer(room){
  clearInterval(state.timerInterval);
  const timer=$('timer'), ring=$('timerRing');
  state.lastWarningSecond=null;
  if(room.paused){timer.textContent='Ⅱ';$('briefingClock').textContent='PAUSED';ring.style.setProperty('--timer-progress','100%');ring.classList.remove('danger');return;}
  if(room.phase==='briefing'&&room.briefingEndsAt){
    const tick=()=>{
      const left=Math.max(0,room.briefingEndsAt-Date.now());
      const seconds=String(Math.ceil(left/1000));
      timer.textContent=seconds;
      $('briefingClock').textContent=seconds;
      ring.style.setProperty('--timer-progress',`${Math.min(100,left/10000*100)}%`);
      ring.classList.remove('danger');
    };
    tick();state.timerInterval=setInterval(tick,200);return;
  }
  if(room.phase==='countdown'){
    let n=3; timer.textContent=n; beep('warning3');
    state.timerInterval=setInterval(()=>{
      n--;
      if(n<=0){clearInterval(state.timerInterval);timer.textContent='GO';beep('win');setTimeout(()=>updateTimer(state.room),450);}
      else {timer.textContent=n; beep(n===2?'warning2':'warning1');}
    },1000);
    return;
  }
  if(room.phase!=='playing'||!room.turnEndsAt){timer.textContent='—';ring.style.setProperty('--timer-progress','100%');ring.classList.remove('danger');return;}
  const total=(room.turnEndsAt-room.turnStartedAt);
  const tick=()=>{
    const left=Math.max(0,room.turnEndsAt-Date.now());
    const sec=left/1000;
    timer.textContent=sec.toFixed(1);
    const pct=Math.max(0,Math.min(100,left/total*100));
    ring.style.setProperty('--timer-progress',pct+'%');
    ring.classList.toggle('danger',sec<=3);
    const whole=Math.ceil(sec);
    if(sec<=3&&sec>0&&whole!==state.lastWarningSecond){
      state.lastWarningSecond=whole;
      beep(whole===3?'warning3':whole===2?'warning2':'warning1');
    }
  };
  tick(); state.timerInterval=setInterval(tick,100);
}
function renderResults(){
  const room=state.room;
  clearInterval(state.timerInterval); clearInterval(state.transitionInterval);
  const winnerIds=room.winnerIds||[];
  const winner=room.players.find(p=>p.id===room.roundWinnerId);
  const match=room.phase==='match_end';
  $('resultsEyebrow').textContent=match?'MATCH COMPLETE':'ROUND COMPLETE';
  $('resultsTitle').textContent=match?(winnerIds.length>1?'IT\'S A TIE!':`${room.players.find(p=>p.id===winnerIds[0])?.displayName||'Player'} WINS THE MATCH!`):`${winner?.displayName||'Player'} wins the round!`;
  $('resultsSub').textContent=match?'Final scoreboard':' +1 point';
  $('scoreboard').innerHTML=room.players.slice().sort((a,b)=>b.score-a.score).map((p,i)=>`<div class="score-row"><div class="av">${characterMarkup(p.characterId,true)}</div><div><b>${i+1}. ${escapeHTML(p.displayName)}</b><small class="muted"> ${p.isMe?'YOU':''}</small></div><div class="sc">${p.score}</div></div>`).join('');
  loadCharacterPortraits($('scoreboard'));
  $('continueRoundBtn').style.display=match?'none':'block';
  $('playAgainBtn').style.display=match&&me()?.isHost?'block':'none';
  $('newRoomBtn').style.display='block';
  if(match){
    $('transitionStatus').textContent='';
    $('resultsHint').textContent=me()?.isHost?'You can start another match with the same table.':'Waiting for the host to play again.';
    beep('win');
    return;
  }
  const ready=room.roundReadyCount||0;
  const connected=room.players.filter(p=>p.connected).length;
  const alreadyReady=room.players.find(p=>p.isMe)?.roundReady;
  $('continueRoundBtn').disabled=!!alreadyReady;
  $('continueRoundBtn').textContent=alreadyReady?'READY ✓':'CONTINUE →';
  $('resultsHint').textContent=`${ready} / ${connected} ready`;
  updateTransition(room);
}

function updateTransition(room){
  clearInterval(state.transitionInterval);
  const status=$('transitionStatus');
  if(room.phase!=='round_end'||!room.roundTransitionEndsAt){ status.textContent=''; return; }
  const tick=()=>{
    const left=Math.max(0,room.roundTransitionEndsAt-Date.now());
    const sec=Math.ceil(left/1000);
    status.textContent=`NEXT ROUND IN ${sec}s`;
    if(sec<=0) clearInterval(state.transitionInterval);
  };
  tick();
  state.transitionInterval=setInterval(tick,250);
}
