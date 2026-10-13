(async () => {
  let THREE = null;
  try {
    THREE = await import('/vendor/three.module.js');
  } catch (localError) {
    console.warn('BEAT THE TIME: local Three.js build unavailable; trying CDN fallback.', localError);
    try {
      THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
    } catch (cdnError) {
      console.error('BEAT THE TIME: Three.js failed to load from both local server and CDN.', cdnError);
      window.dispatchEvent(new CustomEvent('beat-time-3d-failed', { detail: { localError, cdnError } }));
      return;
    }
  }
  window.THREE = THREE;
  (() => {
  if (!window.THREE) return;

  const AVATAR_STYLE=window.BeatTimeAvatars.styles;
  const avatarTextureCache=new Map();
  const avatarCanvas=id=>window.BeatTimeAvatars.canvas(id);
  function avatarSvg(characterId){
    const s=AVATAR_STYLE[characterId]||AVATAR_STYLE.m1;
    const hex=n=>`#${Number(n).toString(16).padStart(6,'0')}`;
    const skin=hex(s.skin),shirt=hex(s.shirt),trim=hex(s.trim),hair=hex(s.hair),eye=hex(s.iris||0x50351f);
    const faceX=s.face?.[0]||1,faceY=s.face?.[1]||1,eyeX=s.eyes?.[0]||1,eyeY=s.eyes?.[1]||1;
    let hairShape='';
    if(s.hairStyle==='spiky') hairShape=`<path d="M91 105 Q78 80 96 61 L87 42 113 55 123 27 143 51 163 22 178 50 205 30 207 59 237 51 222 80 239 105 Q180 76 91 105Z"/>`;
    else if(s.hairStyle==='curly') hairShape=`<path d="M91 105 Q78 68 110 51 Q135 29 169 43 Q209 34 231 67 L232 108Z"/>${[0,1,2,3,4,5,6].map((_,i)=>`<circle cx="${102+i*19}" cy="${60+(i%2)*-10}" r="19"/>`).join('')}`;
    else if(s.hairStyle==='cap') hairShape=`<path d="M91 102 Q90 55 139 48 Q195 43 223 85 L244 94 Q226 108 200 104Z"/><path fill="${hex(s.cap||0x2447db)}" d="M91 79 Q99 43 153 43 Q209 43 224 84 L214 98 Q153 72 91 99Z"/><path fill="${trim}" d="M126 57 Q158 48 190 59"/>`;
    else if(s.hairStyle==='long'||s.hairStyle==='ponytail'||s.hairStyle==='twin'){
      hairShape=`<path d="M89 111 Q76 54 128 39 Q190 20 224 69 Q240 95 228 151 L210 211 193 177 202 104 Q157 68 108 104 L107 185 91 164Z"/>`;
      if(s.hairStyle==='ponytail')hairShape+=`<path d="M216 83 Q267 96 254 145 Q246 167 230 178 Q237 138 211 119Z"/><circle cx="223" cy="91" r="9" fill="${trim}"/>`;
      if(s.hairStyle==='twin')hairShape+=`<path d="M103 75 Q73 88 77 133 Q81 158 94 167 L110 143Z"/><path d="M213 73 Q250 83 256 126 Q255 153 240 166 L218 143Z"/><circle cx="95" cy="89" r="11" fill="${trim}"/><circle cx="225" cy="87" r="11" fill="${trim}"/>`;
    }else if(s.hairStyle==='bob') hairShape=`<path d="M88 110 Q74 48 131 38 Q194 22 226 72 Q239 111 227 170 L207 197 207 103 Q158 66 108 103 L108 194 87 167Z"/>`;
    else if(s.hairStyle==='undercut') hairShape=`<path d="M93 95 Q97 48 147 40 Q196 33 222 72 L213 94 Q157 62 106 104Z"/>`;
    else if(s.hairStyle==='short') hairShape=`<path d="M91 105 Q80 56 126 40 Q185 22 221 69 L230 103 Q201 89 181 85 Q146 77 116 107Z"/>`;
    else hairShape=`<path d="M91 106 Q81 51 134 37 Q194 25 225 70 Q238 91 226 107 Q210 87 188 84 Q158 67 139 88 Q119 105 91 106Z"/><path d="M106 84 Q129 49 161 61 Q148 83 126 98Z" fill="${hex(new THREE.Color(s.hair).lerp(new THREE.Color(s.trim),.12).getHex())}"/>`;
    const mouth=s.mouth==='open'?`<ellipse cx="180" cy="165" rx="15" ry="12" fill="#7d3541"/><path d="M169 162 Q180 158 191 162" stroke="#fff8e9" stroke-width="4" stroke-linecap="round"/>`:
      s.mouth==='grin'?`<path d="M163 161 Q180 179 197 161 Q181 187 163 161Z" fill="#8b3e48" stroke="#512b2c" stroke-width="3"/><path d="M169 163 Q180 167 192 163" stroke="#fff5e3" stroke-width="4"/>`:
      `<path d="M163 164 Q180 180 197 164" fill="none" stroke="#873e49" stroke-width="5" stroke-linecap="round"/>`;
    const freckles=s.freckles?[-1,0,1].map(i=>`<circle cx="${144+i*9}" cy="147" r="2.7" fill="#9a5845"/><circle cx="${216+i*9}" cy="147" r="2.7" fill="#9a5845"/>`).join(''):'';
    const sideHair=s.hairStyle==='long'||s.hairStyle==='bob'||s.hairStyle==='ponytail'||s.hairStyle==='twin'?`<path d="M100 95 Q87 139 103 188 L121 199 116 119Z M220 95 Q236 139 219 188 L201 199 205 119Z"/>`:'';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="520" viewBox="0 0 360 520">
      <ellipse cx="180" cy="494" rx="105" ry="17" fill="#061127" opacity=".42"/>
      <path d="M124 302 Q83 324 82 376 L93 469 Q101 487 143 477 L154 382 180 351 206 382 217 477 Q259 487 267 469 L278 376 Q277 324 236 302Z" fill="#172943" stroke="#10182a" stroke-width="8"/>
      <path d="M92 452 Q117 441 146 456 L145 482 Q119 492 91 480Z M215 456 Q245 441 269 452 L269 480 Q240 492 216 482Z" fill="#5a351f" stroke="#2a211d" stroke-width="7"/>
      <path d="M91 476 Q117 485 146 478 L151 495 Q120 508 78 498 Q77 487 91 476Z M216 478 Q244 485 269 476 Q284 487 278 498 Q238 508 211 495Z" fill="#3a241d" stroke="#211b1b" stroke-width="7"/>
      <path d="M121 190 Q113 205 116 306 Q179 332 244 306 Q247 206 235 190Z" fill="${shirt}" stroke="#273246" stroke-width="8"/>
      <path d="M120 207 Q95 202 85 229 L102 280 Q110 292 127 280 L145 245Z M238 207 Q263 202 273 229 L256 280 Q248 292 231 280 L213 245Z" fill="${shirt}" stroke="#273246" stroke-width="8" stroke-linejoin="round"/>
      <path d="M103 270 Q122 261 134 276 L157 299 Q160 311 149 316 L123 298 Q101 294 96 283Z M257 270 Q238 261 226 276 L203 299 Q200 311 211 316 L237 298 Q259 294 264 283Z" fill="${skin}" stroke="#a36f59" stroke-width="5" stroke-linejoin="round"/>
      <path d="M141 295 Q180 281 219 295 L231 329 Q212 343 180 340 Q148 343 129 329Z" fill="${shirt}" stroke="#273246" stroke-width="7"/>
      <path d="M153 299 L153 314 M207 299 L207 314" stroke="${trim}" stroke-width="4" stroke-linecap="round"/>
      ${s.fit==='hoodie'?`<path d="M147 299 Q180 315 213 299 L208 328 Q180 340 152 328Z" fill="${trim}" stroke="#273246" stroke-width="5"/><path d="M171 216 L169 264 M189 216 L191 264" stroke="#fff0d0" stroke-width="4" stroke-linecap="round"/>`:`<path d="M140 239 Q180 250 220 239" stroke="${trim}" stroke-width="7" fill="none"/>`}
      <path d="M164 175 L164 202 Q180 216 196 202 L196 175Z" fill="${skin}"/>
      <path d="M103 103 Q103 49 180 46 Q257 49 257 103 L246 149 Q237 194 180 202 Q123 194 114 149Z" fill="${skin}" stroke="#5f4338" stroke-width="6" transform="translate(180 123) scale(${faceX} ${faceY}) translate(-180 -123)"/>
      <g transform="translate(180 123) scale(${faceX} ${faceY}) translate(-180 -123)">
        <ellipse cx="106" cy="123" rx="15" ry="23" fill="${skin}" stroke="#5f4338" stroke-width="4"/><ellipse cx="254" cy="123" rx="15" ry="23" fill="${skin}" stroke="#5f4338" stroke-width="4"/>
        <ellipse cx="146" cy="125" rx="${12*eyeX}" ry="${16*eyeY}" fill="#fffdf6"/><ellipse cx="214" cy="125" rx="${12*eyeX}" ry="${16*eyeY}" fill="#fffdf6"/>
        <ellipse cx="148" cy="127" rx="${7*eyeX}" ry="${10*eyeY}" fill="${eye}"/><ellipse cx="216" cy="127" rx="${7*eyeX}" ry="${10*eyeY}" fill="${eye}"/>
        <ellipse cx="149" cy="128" rx="${3.5*eyeX}" ry="${6*eyeY}" fill="#17151a"/><ellipse cx="217" cy="128" rx="${3.5*eyeX}" ry="${6*eyeY}" fill="#17151a"/>
        <circle cx="145" cy="121" r="3.5" fill="#fff"/><circle cx="213" cy="121" r="3.5" fill="#fff"/>
        <path d="M128 101 Q145 ${s.brow==='angled'?88:91} 160 101 M200 101 Q215 ${s.brow==='angled'?88:91} 232 101" fill="none" stroke="${hair}" stroke-width="${s.brow==='angled'?8:6}" stroke-linecap="round"/>
        <path d="M180 128 Q170 147 181 149" fill="none" stroke="#b47662" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="128" cy="151" rx="16" ry="7" fill="#ef9990" opacity=".34"/><ellipse cx="232" cy="151" rx="16" ry="7" fill="#ef9990" opacity=".34"/>
        ${mouth}${freckles}${s.beautyMark?'<circle cx="238" cy="151" r="4" fill="#75493e"/>':''}
      </g>
      <path d="M91 108 Q82 52 133 36 Q192 15 229 60 Q244 78 235 106 Q215 84 198 79 Q174 69 155 83 Q131 101 91 108Z" fill="${hair}" stroke="#261c1a" stroke-width="7" stroke-linejoin="round"/>
      <g fill="${hair}" stroke="#261c1a" stroke-width="5" stroke-linejoin="round">${hairShape}</g>
      <g fill="${hair}" stroke="#261c1a" stroke-width="5" stroke-linejoin="round">${sideHair}</g>
      <path d="M137 328 Q180 342 223 328" fill="none" stroke="${trim}" stroke-width="7"/>
      </svg>`;
  }
  function avatarSvgUrl(id){return `/avatars/${AVATAR_STYLE[id]?id:'m1'}.svg`;}

  const api = { scenes:new Map() };
  window.BeatTime3D = api;

  // A small stepped light ramp gives the code-built avatars a clean cartoon
  // finish while leaving the room, table, and UI on their existing materials.
  const toonRamp = new THREE.DataTexture(new Uint8Array([
    52, 76, 110, 148, 184, 216, 242, 255
  ]), 8, 1, THREE.RedFormat);
  toonRamp.minFilter = THREE.NearestFilter;
  toonRamp.magFilter = THREE.NearestFilter;
  toonRamp.generateMipmaps = false;
  toonRamp.needsUpdate = true;

  function mat(color, rough=.65, metal=0){ return new THREE.MeshStandardMaterial({color, roughness:rough, metalness:metal}); }
  function box(w,h,d,material,bevel=0){
    const g = new THREE.BoxGeometry(w,h,d);
    const m = new THREE.Mesh(g,material);
    return m;
  }
  function cyl(r1,r2,h,material,segments=32){ return new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material); }
  function sphere(r,material){ return new THREE.Mesh(new THREE.SphereGeometry(r,28,20),material); }

  function roundedBox(w,h,d,material,bevel=.12){
    // Soft-looking box built from a bevelled cube approximation.
    const g=new THREE.BoxGeometry(w,h,d,3,3,3);
    const m=new THREE.Mesh(g,material); m.castShadow=true; m.receiveShadow=true;
    return m;
  }

  function mesh(g,geometry,material,name,position,scale){
    const m=new THREE.Mesh(geometry,material); if(name)m.name=name; if(position)m.position.set(...position); if(scale)m.scale.set(...scale);
    m.castShadow=true; m.receiveShadow=true; g.add(m); return m;
  }
  function ellipsoid(g,material,name,position,scale){return mesh(g,new THREE.SphereGeometry(1,32,24),material,name,position,scale);}
  function lineTube(g,points,radius,material,name){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    return mesh(g,new THREE.TubeGeometry(curve,Math.max(12,points.length*8),radius,8,false),material,name);
  }
  function limbSegment(g,start,end,radiusA,radiusB,material,name){
    const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),delta=b.clone().sub(a),length=Math.max(.01,delta.length());
    const part=mesh(g,new THREE.CylinderGeometry(radiusB,radiusA,length,20,1),material,name);
    part.position.copy(a).add(b).multiplyScalar(.5);part.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
    return part;
  }
  function shapedHeadGeometry(){
    const outline=[[0,-.48],[.12,-.48],[.24,-.44],[.33,-.34],[.385,-.19],[.405,.02],[.39,.22],[.33,.36],[.24,.45],[.12,.49],[0,.49]];
    return new THREE.LatheGeometry(outline.map(p=>new THREE.Vector2(...p)),48);
  }

  function makeChair(color=0x183763){
    const g=new THREE.Group();
    const base=cyl(.60,.60,.045,mat(color,.65,.04),40);base.position.y=.035;g.add(base);
    const edge=new THREE.Mesh(new THREE.TorusGeometry(.57,.018,8,40),mat(0x38cbed,.34,.2));edge.rotation.x=Math.PI/2;edge.position.y=.06;g.add(edge);
    return g;
  }

  function addHair(g,s,hair,accent){
    const base=ellipsoid(g,hair,'hairCap',[0,2.40,-.015],[.385,.285,.365]);
    const lock=(x,y,z,sx,sy,sz,rot=0,material=hair)=>{const q=ellipsoid(g,material,null,[x,y,z],[sx,sy,sz]);q.rotation.z=rot;return q;};
    const rear=(x,y,sy=.72)=>{const q=ellipsoid(g,hair,null,[x,y,-.12],[.17,sy,.27]);q.rotation.z=x<0?-.06:.06;return q;};
    if(s.hairStyle==='spiky'){
      for(let i=0;i<6;i++){const x=(i-2.5)*.105,spike=mesh(g,new THREE.ConeGeometry(.115,.34+(i%2)*.04,20),hair);spike.position.set(x,2.63-Math.abs(i-2.5)*.018,.015);spike.rotation.z=-x*.75;}
      lock(-.12,2.48,.30,.22,.12,.10,-.3,accent);
    }else if(s.hairStyle==='curly'){
      for(let row=0;row<2;row++)for(let i=0;i<9;i++){
        const a=(i/9)*Math.PI*2,rad=.30-row*.08,y=2.47+Math.sin(a)*.12+row*.07,z=-.015+Math.cos(a)*.27;
        const c=ellipsoid(g,(i%3===0?accent:hair),null,[Math.cos(a)*rad,y,z],[.105,.12,.105]);c.rotation.z=Math.sin(a)*.25;
      }
      for(let i=0;i<3;i++)lock(-.19+i*.12,2.48,.30,.12,.10,.11,-.2,accent);
    }else if(s.hairStyle==='long'||s.hairStyle==='bob'){
      rear(-.28,s.hairStyle==='long'?1.94:2.08,s.hairStyle==='long'?.78:.46);rear(.28,s.hairStyle==='long'?1.94:2.08,s.hairStyle==='long'?.78:.46);
      lock(-.34,s.hairStyle==='long'?1.94:2.08,.02,.115,s.hairStyle==='long'?.49:.32,.20,-.08);
      lock(.34,s.hairStyle==='long'?1.94:2.08,.02,.115,s.hairStyle==='long'?.49:.32,.20,.08);
      lock(-.15,2.51,.29,.20,.13,.10,-.28,accent);lock(.08,2.55,.27,.22,.12,.10,.1);
    }else if(s.hairStyle==='ponytail'||s.hairStyle==='twin'){
      const count=s.hairStyle==='twin'?2:1,sideList=count===2?[-1,1]:[-1];
      sideList.forEach(side=>{
        const p=[side*.26,2.37,-.18],end=[side*.42,1.90,-.30];
        lineTube(g,[p,[side*.34,2.2,-.22],[side*.48,2.04,-.3],end],.115,hair,'ponytail');
        ellipsoid(g,accent,'hairTie',[side*.32,2.30,-.19],[.09,.07,.09]);
        ellipsoid(g,hair,'tailTip',[end[0],end[1]-.10,end[2]],[.13,.20,.12]);
      });
      lock(-.16,2.51,.29,.22,.13,.10,-.20,accent);lock(.08,2.53,.27,.19,.12,.10,.12);
    }else if(s.hairStyle==='cap'){
      const capColor=mat(s.cap||0x2447db,.38,.12);
      const crown=ellipsoid(g,capColor,'capCrown',[0,2.53,.015],[.39,.18,.37]);
      const brim=roundedBox(.72,.055,.31,capColor,.09);brim.position.set(0,2.49,.31);brim.rotation.x=-.10;g.add(brim);
      const badge=ellipsoid(g,accent,'capBadge',[0,2.55,.373],[.075,.05,.018]);
      lock(-.18,2.45,.31,.16,.08,.09,-.1);
    }else if(s.hairStyle==='undercut'){
      lock(-.1,2.49,.26,.29,.15,.11,-.22,accent);lock(.16,2.52,.18,.23,.13,.09,.12);
      [-1,1].forEach(side=>{const fade=ellipsoid(g,hair,null,[side*.31,2.31,-.04],[.08,.15,.27]);fade.rotation.z=side*.12;});
    }else{
      lock(-.12,2.51,.29,.31,.15,.12,-.20,hair);lock(.10,2.54,.23,.25,.12,.10,.12,accent);
      [-1,1].forEach(side=>rear(side*.31,2.31,.30));
    }
    return base;
  }

  function addOutfitDetails(g,s,shirt,trim,skin,hair){
    const gold=mat(0xffd65a,.32,.52),dark=mat(0x17243d,.54,.08),light=mat(0xf6f7ff,.42);
    const collar=new THREE.Mesh(new THREE.TorusGeometry(.17,.045,12,40),trim);collar.position.set(0,1.78,.015);collar.rotation.x=Math.PI/2;g.add(collar);
    const zipper=mat(0xd5e2f2,.3,.7);
    if(['hoodie','zip','jacket','varsity'].includes(s.fit)){
      lineTube(g,[[0,1.70,.36],[0,1.43,.47],[0,1.12,.44]],.012,zipper,'zipper');
      for(let y=1.45;y>1.16;y-=.10){const tooth=roundedBox(.035,.018,.012,zipper,.006);tooth.position.set(0,y,.474);g.add(tooth);}
    }
    if(s.fit==='hoodie'){
      const pocket=roundedBox(.42,.22,.055,trim,.06);pocket.position.set(0,1.03,.42);g.add(pocket);
      [-1,1].forEach(side=>{
        lineTube(g,[[side*.075,1.70,.36],[side*.09,1.51,.43],[side*.13,1.34,.45]],.012,light,'hood-string');
        const tip=ellipsoid(g,gold,'drawstring-tip',[side*.13,1.32,.45],[.022,.045,.022]);
      });
      const hood=ellipsoid(g,trim,'hood',[0,1.76,-.26],[.32,.25,.16]);
    }else if(s.fit==='varsity'){
      const stripe=roundedBox(.055,.68,.018,light,.015);stripe.position.set(.22,1.39,.416);g.add(stripe);
      const stripe2=stripe.clone();stripe2.position.x=-.22;g.add(stripe2);
      const patch=roundedBox(.17,.19,.035,gold,.05);patch.position.set(.28,1.53,.40);g.add(patch);
      const letter=roundedBox(.06,.10,.012,shirt,.01);letter.position.set(.28,1.53,.422);g.add(letter);
    }else if(s.fit==='sport'){
      [-1,1].forEach(side=>{
        const stripe=roundedBox(.075,.71,.026,trim,.025);stripe.position.set(side*.38,1.38,.16);stripe.rotation.z=side*.16;g.add(stripe);
      });
      const crest=new THREE.Mesh(new THREE.TorusGeometry(.105,.018,8,24),gold);crest.position.set(.29,1.52,.39);g.add(crest);
    }else if(s.fit==='team'){
      const emblem=new THREE.Mesh(new THREE.TorusGeometry(.12,.022,8,24),gold);emblem.position.set(.27,1.50,.40);g.add(emblem);
      const center=ellipsoid(g,light,'team-emblem',[.27,1.50,.405],[.045,.045,.018]);
    }else if(s.fit==='sweater'){
      const band=roundedBox(.82,.12,.035,trim,.035);band.position.set(0,1.26,.40);g.add(band);
      const band2=roundedBox(.78,.035,.04,gold,.016);band2.position.set(0,1.11,.40);g.add(band2);
    }else if(s.fit==='tee'){
      const badge=roundedBox(.20,.22,.035,trim,.07);badge.position.set(.26,1.48,.39);g.add(badge);
      const sun=new THREE.Mesh(new THREE.TorusGeometry(.06,.012,8,20),gold);sun.position.set(.26,1.48,.415);g.add(sun);
    }
    // Sleeves, cuffs, and seams visually join the upper body to the posed arms.
    [-1,1].forEach(side=>{
      const cuff=ellipsoid(g,trim,null,[side*.49,1.27,.30],[.14,.10,.14]);
      lineTube(g,[[side*.48,1.58,.27],[side*.42,1.40,.38],[side*.42,1.27,.42]],.008,light,'sleeve-seam');
    });
    if(s.glasses){
      const frame=mat(0x182235,.22,.65);
      [-.15,.15].forEach(x=>{
        const rim=new THREE.Mesh(new THREE.TorusGeometry(.112,.018,10,28),frame);rim.position.set(x,2.22,.37);g.add(rim);
      });
      const bridge=roundedBox(.075,.025,.022,frame,.012);bridge.position.set(0,2.22,.38);g.add(bridge);
      [-1,1].forEach(side=>lineTube(g,[[side*.26,2.22,.34],[side*.35,2.20,.20],[side*.37,2.19,.06]],.012,frame,'glasses-arm'));
    }
    if(s.beard){
      const beard=ellipsoid(g,hair,'beard',[0,1.97,.29],[.255,.17,.145]);
      [-1,1].forEach(side=>{const sideburn=ellipsoid(g,hair,null,[side*.29,2.08,.12],[.075,.19,.105]);});
      const moustache=ellipsoid(g,hair,'moustache',[0,2.035,.402],[.13,.045,.052]);
    }
    if(s.hairStyle==='ponytail'||s.hairStyle==='twin')[-1,1].forEach(side=>{
      const stud=new THREE.Mesh(new THREE.SphereGeometry(.045,16,12),gold);stud.position.set(side*.405,2.11,.025);g.add(stud);
    });
  }

  function makeCharacter(characterId){
    const id=AVATAR_STYLE[characterId]?characterId:'m1';
    // Use the same purpose-built seated 3D model for the live table as the
    // character preview. The old canvas sprite was an upright portrait, which
    // made every player look like they were standing beside the table.
    return makeCharacterMeshPrototype(id);
  }

  function makeCharacterMeshPrototype(characterId){
    const s=AVATAR_STYLE[characterId]||AVATAR_STYLE.m1;
    const g=new THREE.Group();g.userData.characterId=characterId;g.userData.anim={};
    const skin=mat(s.skin,.68),shirt=mat(s.shirt,.57),trim=mat(s.trim,.48,.04),hair=mat(s.hair,.72),hairLight=mat(new THREE.Color(s.hair).lerp(new THREE.Color(s.trim),.045),.61);
    const pants=mat(0x1a2840,.62),shoe=mat(0x101827,.3,.12),sole=mat(0xe5eefb,.42),white=mat(0xfffbf4,.22),eye=mat(0x17151a,.15),iris=mat(s.iris||0x4a3121,.22),mouth=mat(0x7c3340,.48);
    // Seated silhouette: hips settle onto the chair cushion; legs bend forward and shoes rest low.
    const hips=ellipsoid(g,shirt,'hips',[0,1.04,.02],[.43,.23,.41]);g.userData.anim.hips=hips;
    const torsoGroup=new THREE.Group();torsoGroup.name='torso';torsoGroup.position.y=.91;torsoGroup.rotation.x=.045;g.add(torsoGroup);g.userData.anim.torso=torsoGroup;
    // Soft tailored seated torso: a gently tapered waist and sloped shoulders keep
    // the silhouette closer to a sculpted character than a stack of toy parts.
    const bodyProfile=[[0,0],[.28,0],[.37,.045],[.42,.13],[.405,.28],[.455,.52],[.48,.68],[.435,.80],[.34,.91],[.20,.98],[0,1.00]].map(p=>new THREE.Vector2(...p));
    const body=mesh(torsoGroup,new THREE.LatheGeometry(bodyProfile,64),shirt,'jacket-body',[0,0,0],[1,1,.84]);
    body.geometry.computeVertexNormals();
    const neck=ellipsoid(g,skin,'neck',[0,1.82,.005],[.14,.20,.14]);
    // Head shape is softened at the jaw and enlarged slightly for a readable, expressive cast.
    const head=mesh(g,shapedHeadGeometry(),skin,'head',[0,2.20,.015],[...(s.face||[1,1]),.88]);g.userData.anim.head=head;
    [-1,1].forEach(side=>{
      const ear=ellipsoid(g,skin,null,[side*.395,2.18,0],[.085,.12,.075]);
      const earInset=ellipsoid(g,mat(0xc87d70,.72),null,[side*.423,2.18,.025],[.035,.064,.028]);
    });
    addHair(g,s,hair,hairLight);
    const browMat=mat(s.hair,.58);
    [-1,1].forEach(side=>{
      const x=side*.15;
      const eyeScale=s.eyes||[1,1], ex=x*(s.face?.[0]||1);
      const socket=ellipsoid(g,skin,null,[ex,2.255,.333],[.125*eyeScale[0],.145*eyeScale[1],.032]);
      const eyeWhite=ellipsoid(g,white,side<0?'eyeL':'eyeR',[ex,2.25,.355],[.103*eyeScale[0],.124*eyeScale[1],.032]);
      eyeWhite.userData.openScaleY=eyeWhite.scale.y;
      const irisMesh=ellipsoid(g,iris,null,[ex+side*.008,2.245,.389],[.056*eyeScale[0],.067*eyeScale[1],.021]);
      const pupil=ellipsoid(g,eye,null,[ex+side*.008,2.245,.407],[.029,.041*eyeScale[1],.012]);
      const sparkle=ellipsoid(g,white,null,[ex-.018,2.269,.419],[.017,.020,.009]);
      // Curved upper lids integrate the eyes into the face and add expression.
      lineTube(g,[[ex-.090,2.264,.375],[ex-.060,2.322,.39],[ex,2.337,.395],[ex+.060,2.322,.39],[ex+.090,2.264,.375]],.014,skin,'upper-eyelid');
      const tilt=s.brow==='angled'?side*.065:0;
      const brow=lineTube(g,[[ex-.105,2.405-tilt,.348],[ex-.055,2.43,.365],[ex,2.435,.37],[ex+.055,2.425,.365],[ex+.10,2.41+tilt,.348]],s.brow==='soft'?.025:.043,browMat,'brow');
    });
    const nose=ellipsoid(g,mat(new THREE.Color(s.skin).multiplyScalar(.98),.60),'nose',[0,2.145,.39],[.054*(s.face?.[0]||1),.064,.052]);
    const noseHighlight=ellipsoid(g,mat(0xffdfc7,.42),null,[-.014,2.16,.432],[.019,.012,.009]);
    if(s.mouth==='smile'){
      lineTube(g,[[-.105,2.01,.376],[-.060,1.972,.388],[0,1.960,.393],[.060,1.972,.388],[.105,2.01,.376]],.022,mat(0x8f4650,.55),'smile');
    }else{
      const openScale=s.mouth==='open'?[.095,.069,.035]:[.102,.052,.035];
      ellipsoid(g,mouth,'mouth',[0,2.005,.354],openScale);
      if(s.mouth==='grin'){
        const teeth=roundedBox(.11,.024,.018,white,.01);teeth.position.set(0,2.032,.382);g.add(teeth);
      }
      lineTube(g,[[-.075,1.982,.38],[-.04,1.974,.385],[0,1.972,.386],[.04,1.974,.385],[.075,1.982,.38]],.009,mat(0xb95b62,.55),'lower-lip');
    }
    const cheek=mat(0xd99383,.82);
    [-1,1].forEach(side=>ellipsoid(g,cheek,null,[side*.265,2.08,.31],[.077,.038,.017]));
    if(s.freckles){
      const freckleMat=mat(0x9a5845,.84);
      [-1,1].forEach(side=>[-1,0,1].forEach(i=>ellipsoid(g,freckleMat,null,[side*(.225+i*.027),2.075+Math.abs(i)*.008,.337],[.014,.014,.010])));
    }
    if(s.beautyMark)ellipsoid(g,mat(0x744739,.78),null,[.285,2.065,.334],[.019,.019,.012]);
    addOutfitDetails(g,s,shirt,trim,skin,hair);

    const arms={upperL:null,upperR:null,foreL:null,foreR:null,handL:null,handR:null};
    [-1,1].forEach(side=>{
      const shoulder=new THREE.Group();shoulder.name=side<0?'upperL':'upperR';shoulder.position.set(side*.405,1.64,.015);g.add(shoulder);
      // Elbows open outward, forearms angle forward and hands reach the tabletop.
      // This reads as a player leaning into the game instead of a standing pose.
      const elbow=[side*.18,-.34,.25],wrist=[side*.12,-.62,.76];
      const shoulderCap=ellipsoid(shoulder,shirt,'shoulder-cap',[0,-.055,.025],[.205,.20,.205]);
      limbSegment(shoulder,[0,0,0],elbow,.17,.15,shirt,'sleeve');
      ellipsoid(shoulder,shirt,'elbow-softener',[...elbow],[.145,.15,.15]);
      const cuff=ellipsoid(shoulder,trim,'cuff',[elbow[0],elbow[1],elbow[2]],[.145,.09,.14]);
      const fore=new THREE.Group();fore.name=side<0?'foreL':'foreR';fore.position.set(...elbow);shoulder.add(fore);
      limbSegment(fore,[0,0,0],[side*-.06,-.28,.49],.105,.086,skin,'forearm');
      const palm=ellipsoid(fore,skin,side<0?'handL':'handR',[side*-.06,-.31,.53],[.12,.068,.15]);
      [-1.5,-.5,.5,1.5].forEach((n,i)=>{
        const x=side*-.06+n*.036;
        limbSegment(fore,[x,-.32,.61],[x+n*.006,-.33,.70-(Math.abs(n)*.012)],.023,.019,skin,'finger');
      });
      limbSegment(fore,[side*-.16,-.28,.52],[side*-.20,-.30,.61],.032,.025,skin,'thumb');
      if(side<0){arms.upperL=shoulder;arms.foreL=fore;arms.handL=palm;}else{arms.upperR=shoulder;arms.foreR=fore;arms.handR=palm;}
    });
    g.userData.anim.arms=arms;

    [-1,1].forEach(side=>{
      const legMat=pants;
      const thigh=ellipsoid(g,legMat,side<0?'thighL':'thighR',[side*.205,.78,.35],[.18,.16,.34]);thigh.rotation.x=-.18;
      ellipsoid(g,legMat,null,[side*.22,.66,.62],[.15,.15,.16]);
      limbSegment(g,[side*.22,.63,.62],[side*.22,.29,.57],.13,.105,legMat,side<0?'shinL':'shinR');
      const shoeBase=ellipsoid(g,sole,null,[side*.22,.14,.59],[.17,.065,.30]);
      const sneaker=ellipsoid(g,shoe,null,[side*.22,.22,.58],[.175,.135,.31]);
      const toe=ellipsoid(g,mat(s.trim,.48),null,[side*.22,.245,.79],[.13,.073,.13]);
      lineTube(g,[[side*.22-.10,.31,.53],[side*.22,.335,.58],[side*.22+.10,.31,.53]],.012,sole,'sneaker-lace');
      const pantCuff=ellipsoid(g,trim,null,[side*.22,.34,.455],[.12,.06,.12]);
    });
    g.traverse(node=>{
      if(!node.isMesh || !node.material || !node.material.isMeshStandardMaterial) return;
      const source=node.material;
      node.material=new THREE.MeshToonMaterial({
        color:source.color,
        map:source.map||null,
        transparent:source.transparent,
        opacity:source.opacity,
        side:source.side,
        depthWrite:source.depthWrite,
        gradientMap:toonRamp
      });
    });
    return g;
  }

  function animateCharacter(item,t,dt){
    const c=item.character; if(!c || !c.userData.anim) return;
    const a=c.userData.anim;
    const phase=item.phase||0;
    const idle=Math.sin(t*.0022+phase);
    const slow=Math.sin(t*.0011+phase*1.7);
    const active=item.active && item.alive!==false;
    // Natural idle: breathing, tiny head turns and posture shifts.
    c.position.y = (active?.015:0) + idle*.018;
    c.rotation.x = (active?.025:0) + slow*.012;
    c.rotation.z = slow*.018;
    if(a.torso){ a.torso.scale.y=1 + idle*.012; }
    if(a.head){
      a.head.rotation.y = slow*.075;
      a.head.rotation.x = (active?.035:0) + idle*.018;
    }
    // Active player visibly leans in and taps/typing motions alternate between hands.
    const tap=Math.max(0,Math.sin(t*.0085+phase));
    const tap2=Math.max(0,Math.sin(t*.0085+phase+Math.PI));
    if(a.arms){
      const L=a.arms.upperL,R=a.arms.upperR,FL=a.arms.foreL,FR=a.arms.foreR,HL=a.arms.handL,HR=a.arms.handR;
      if(active){
        c.position.z = -.035 + Math.sin(t*.004+phase)*.018;
        c.rotation.x = .045 + idle*.012;
        L.rotation.x=-.08-tap*.12; R.rotation.x=-.08-tap2*.12;
        FL.rotation.x=-.10-tap*.14; FR.rotation.x=-.10-tap2*.14;
        HL.rotation.x=tap*.08; HR.rotation.x=tap2*.08;
      } else {
        c.position.z = 0;
        L.rotation.x=-.04+idle*.022; R.rotation.x=-.04-idle*.022;
        FL.rotation.x=-.05+slow*.025; FR.rotation.x=-.05-slow*.025;
        HL.rotation.x=0; HR.rotation.x=0;
      }
    }
    // Occasional natural blink, staggered per seat.
    const blinkPhase=(t*.001+phase)%5.8;
    const blink=blinkPhase>5.18 && blinkPhase<5.36 ? .10 : 1;
    if(c.children){
      const eyeL=c.getObjectByName('eyeL'),eyeR=c.getObjectByName('eyeR');
      if(eyeL) eyeL.scale.y=(eyeL.userData.openScaleY||.084)*blink; if(eyeR) eyeR.scale.y=(eyeR.userData.openScaleY||.084)*blink;
    }
  }

  function labelSprite(text,score,active,out){
    const c=document.createElement('canvas');c.width=420;c.height=110;const ctx=c.getContext('2d');
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle=active?'rgba(255,199,44,.95)':'rgba(4,12,29,.94)';
    roundRect(ctx,8,8,404,94,28);ctx.fill();
    ctx.strokeStyle=active?'#ffe46a':'#2d568f';ctx.lineWidth=5;ctx.stroke();
    ctx.fillStyle=out?'#8995ab':'#ffffff';ctx.font='800 30px Inter, Arial';ctx.textAlign='center';ctx.fillText(text,210,49);
    ctx.fillStyle=active?'#111827':'#90a7cc';ctx.font='700 22px Inter, Arial';ctx.fillText(`SCORE ${score}`,210,80);
    const tex=new THREE.CanvasTexture(c);tex.needsUpdate=true;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sp.scale.set(1.65,.43,1);sp.position.y=2.5;return sp;
  }
  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

  function addRoomDecor(scene){
    const wall=mat(0x0b1222,.92), wood=mat(0x5a301b,.55), shelfMat=mat(0x1a2436,.72), plantMat=mat(0x1d8a62,.75), potMat=mat(0x9b5431,.7);
    const back=box(22,8,.24,wall);back.position.set(0,4,-8);scene.add(back);
    const left=box(.24,8,16,wall);left.position.set(-11,4,0);scene.add(left);
    const right=box(.24,8,16,wall);right.position.set(11,4,0);scene.add(right);
    const rug=cyl(9.2,9.2,.06,mat(0x111c35,.95),64);rug.position.y=.01;scene.add(rug);

    // Large back window with a soft city glow.
    const windowFrame=mat(0x111a2b,.55,.15), glass=mat(0x0d3150,.22,.1);
    const win=box(8.5,4.3,.16,glass);win.position.set(0,5,-7.82);scene.add(win);
    [[-4.35,0],[4.35,0]].forEach(([x])=>{const p=box(.16,4.55,.22,windowFrame);p.position.set(x,5,-7.68);scene.add(p);});
    const wTop=box(8.7,.16,.22,windowFrame);wTop.position.set(0,7.18,-7.68);scene.add(wTop);
    const wBottom=box(8.7,.16,.22,windowFrame);wBottom.position.set(0,2.82,-7.68);scene.add(wBottom);
    const wMid=box(.12,4.25,.22,windowFrame);wMid.position.set(0,5,-7.68);scene.add(wMid);
    for(let i=0;i<24;i++){
      const b=box(.08+.06*(i%3),.08+.12*(i%4),.03,mat(i%2?0x28c8ff:0xffc04a,.35,.1));
      b.position.set(-3.9+(i%8)*1.1,3.25+Math.floor(i/8)*.9,-7.61);scene.add(b);
    }

    // Floating shelves / posters for the party-room feel.
    for(let row=0;row<2;row++){
      const shelf=box(3.4,.14,.42,shelfMat);shelf.position.set(-7.1,4.0+row*1.65,-7.55);scene.add(shelf);
      for(let j=0;j<4;j++){
        const obj=box(.35,.28,.3,j%2?mat(0x3153a4,.5):mat(0xe08b31,.55));obj.position.set(-8.25+j*.75,4.25+row*1.65,-7.28);scene.add(obj);
      }
    }
    for(let j=0;j<3;j++){
      const frame=box(1.05,1.2,.08,mat(j===1?0xff8b2c:0x1e74c8,.45,.1));frame.position.set(6.0+j*1.45,5.1,-7.52);scene.add(frame);
    }

    function plant(x,z,scale=1){
      const pot=cyl(.28,.22,.45,potMat,20);pot.position.set(x,.28,z);pot.scale.setScalar(scale);scene.add(pot);
      for(let i=0;i<6;i++){const leaf=sphere(.16,plantMat);const a=i/6*Math.PI*2;leaf.position.set(x+Math.cos(a)*.22*scale,.72+Math.sin(i)*.06,z+Math.sin(a)*.22*scale);leaf.scale.set(.7,1.6,.5);leaf.rotation.z=Math.cos(a)*.45;scene.add(leaf);}
    }
    plant(-8.5,-6.8,1.35);plant(8.3,-6.8,1.15);

    // Hanging pendant lights.
    for(let i=-1;i<=1;i++){
      const stem=cyl(.025,.025,1.1,mat(0x303b4d,.5,.4),10);stem.position.set(i*3.7,7.2,-1.7);scene.add(stem);
      const lamp=cyl(.42,.20,.22,mat(0xffb12d,.28,.05),32);lamp.position.set(i*3.7,6.6,-1.7);scene.add(lamp);
      const light=new THREE.PointLight(0xff9b32,5.5,8);light.position.set(i*3.7,6.3,-1.7);scene.add(light);
    }
  }

  function buildScene(canvas){
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x040712);scene.fog=new THREE.Fog(0x040712,12,28);
    const camera=new THREE.PerspectiveCamera(47,1,.1,50);camera.position.set(0,11.8,14.8);camera.lookAt(0,.85,0);
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
    const ambient=new THREE.HemisphereLight(0x8eb8ff,0x080a14,2.1);scene.add(ambient);
    const key=new THREE.DirectionalLight(0xffd7a0,4.2);key.position.set(4,10,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
    const rim=new THREE.PointLight(0x14dfff,28,18);rim.position.set(-5,4,-2);scene.add(rim);
    const purple=new THREE.PointLight(0x8d45ff,24,17);purple.position.set(6,3,-4);scene.add(purple);
    const floor=box(24,.2,24,mat(0x090f1d,.86));floor.position.y=-.12;floor.receiveShadow=true;scene.add(floor);
    addRoomDecor(scene);

    const table=cyl(4.25,4.25,.62,mat(0x7a431f,.40),64);table.position.y=.65;table.castShadow=true;table.receiveShadow=true;scene.add(table);
    const edge=cyl(4.42,4.42,.18,mat(0x241208,.34),64);edge.position.y=.47;edge.castShadow=true;scene.add(edge);
    const inner=cyl(3.72,3.72,.05,mat(0xb7682d,.38),64);inner.position.y=.99;scene.add(inner);
    // Full tabletop brand skin. The entire playable tabletop gets a BEAT THE TIME
    // design, and the skin changes every 5 seconds. The wooden rim stays visible.
    const posterGroup=new THREE.Group();
    posterGroup.position.y=1.025;
    scene.add(posterGroup);

    function makePosterTexture(index){
      const c=document.createElement('canvas'); c.width=1024; c.height=1024;
      const x=c.getContext('2d');
      const palettes=[
        ['#06152e','#0d6bff','#20e5ff','#ffd72f'],
        ['#18082f','#7629ff','#ff2e73','#fff15c'],
        ['#06241d','#0bb987','#c8ff45','#ffffff'],
        ['#2b1606','#ff8e17','#ffe15a','#fff7d6'],
        ['#24070c','#ff3654','#ff9630','#ffd72f']
      ];
      const pal=palettes[index%palettes.length];
      const bg=x.createRadialGradient(512,430,60,512,512,760);
      bg.addColorStop(0,pal[2]); bg.addColorStop(.38,pal[1]); bg.addColorStop(1,pal[0]);
      x.fillStyle=bg; x.fillRect(0,0,1024,1024);

      x.globalAlpha=.18;
      for(let i=0;i<18;i++){
        x.beginPath();
        x.arc(512,512,150+i*38,0,Math.PI*2);
        x.strokeStyle=pal[2]; x.lineWidth=5; x.stroke();
      }
      x.globalAlpha=.11;
      for(let i=-1200;i<1400;i+=110){
        x.save(); x.translate(512,512); x.rotate(-.48);
        x.fillStyle=pal[3]; x.fillRect(i,-520,42,1500); x.restore();
      }
      x.globalAlpha=1;

      // Strong tabletop branding that remains readable from the gameplay camera.
      x.save(); x.translate(512,512); x.rotate(-.08);
      x.textAlign='center'; x.textBaseline='middle';
      x.shadowColor='rgba(0,0,0,.45)'; x.shadowBlur=24; x.shadowOffsetY=10;
      x.fillStyle='#ffffff'; x.font='900 104px Arial Black, Arial';
      x.fillText('BEAT',0,-62);
      x.fillStyle=pal[3]; x.font='900 100px Arial Black, Arial';
      x.fillText('THE TIME',0,55);
      x.shadowBlur=0; x.shadowOffsetY=0;
      x.fillStyle='#ffffff'; x.globalAlpha=.9; x.font='800 25px Arial';
      const captions=['THINK FAST • STAY ALIVE','ONE WORD • ONE CHANCE','NO REPEATS • NO MERCY','DODGE THE CLOCK','YOUR TABLE • YOUR TURN'];
      x.fillText(captions[index%captions.length],0,142);
      x.restore();

      x.globalAlpha=.8;
      x.strokeStyle=pal[3]; x.lineWidth=10;
      x.beginPath(); x.arc(512,512,472,0,Math.PI*2); x.stroke();
      x.globalAlpha=1;
      return new THREE.CanvasTexture(c);
    }

    const posterMaterials=[];
    for(let i=0;i<5;i++){
      const texture=makePosterTexture(i); texture.colorSpace=THREE.SRGBColorSpace; texture.center.set(.5,.5); texture.rotation=Math.PI/2;
      posterMaterials.push(new THREE.MeshStandardMaterial({map:texture,roughness:.62,metalness:.04}));
    }
    const poster=cyl(3.64,3.64,.035,posterMaterials[0],128);
    poster.rotation.y=0; poster.castShadow=false; poster.receiveShadow=false;
    posterGroup.add(poster);
    const posterGlow=new THREE.Mesh(
      new THREE.TorusGeometry(3.62,.028,10,128),
      new THREE.MeshBasicMaterial({color:0x16dcff,transparent:true,opacity:.46})
    );
    posterGlow.rotation.x=Math.PI/2; posterGlow.position.y=.022; posterGroup.add(posterGlow);
    let posterIndex=0;
    let posterLastSwitch=performance.now();
    let posterTarget=0;

    const room=new THREE.Group();room.userData.players=new Map();scene.add(room);
    const state={scene,camera,renderer,room,canvas,last:performance.now()};api.scenes.set(canvas,state);
    function resize(){const r=canvas.getBoundingClientRect();const w=Math.max(1,r.width),h=Math.max(1,r.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    state.resize=resize;
    resize();
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => resize());
      ro.observe(canvas);
      state.resizeObserver = ro;
    }
    function animate(t){
      const dt=Math.min(.04,(t-state.last)/1000);state.last=t;
      room.userData.players.forEach(v=>{
        const pulse=Math.sin(t*.006+(v.phase||0));
        v.group.position.y=.02 + (v.active?pulse*.035:Math.sin(t*.0016+(v.phase||0))*.012);
        if(v.active){v.glow.material.opacity=.56+Math.sin(t*.008+(v.phase||0))*.18;}
        else v.glow.material.opacity=v.alive===false?.04:.18;
        const target=v.active?1.045:1;
        v.group.scale.lerp(new THREE.Vector3(target,target,target),Math.min(1,dt*7));
        animateCharacter(v,t,dt);
      });
      // Swap the full tabletop design every 5 seconds.
      if(t-posterLastSwitch>=5000){
        posterLastSwitch=t;
        posterIndex=(posterIndex+1)%posterMaterials.length;
        posterTarget=posterIndex;
      }
      if(poster.material!==posterMaterials[posterTarget]) poster.material=posterMaterials[posterTarget];
      posterGlow.rotation.z += dt*.45;
      posterGlow.material.opacity=.48+Math.sin(t*.003)*.14;
      renderer.render(scene,camera);requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);window.addEventListener('resize',resize);return state;
  }

  api.init=function(canvas){ if(!canvas) return null; if(api.scenes.has(canvas)) return api.scenes.get(canvas); return buildScene(canvas); };
  api.syncPlayers=function(canvas,players){
    const s=api.init(canvas);if(!s)return;
    const map=s.room.userData.players;
    // Gameplay players use HTML portrait-and-score cards around the table.
    // Clear any 3D player groups left over from an earlier scene refresh.
    for(const item of map.values()) s.room.remove(item.group);
    map.clear();
  };
  api.resize=function(canvas){ const s=canvas && api.scenes.get(canvas); if(s && s.resize) s.resize(); };
  api.setCurrent=function(id){window.__beatCurrentPlayerId=id;};
  // Shared constructors let the picker and portrait cache use the exact same
  // character meshes as the live table scene.
  api.createCharacter=makeCharacter;
  api.createChair=makeChair;
  api.animateCharacter=animateCharacter;
})();

// Character picker, lobby, and scoreboard portraits are rendered from the live
// Three.js models. The DOM/CSS still owns layout and all selection behavior.
(() => {
  const THREE=window.THREE,api=window.BeatTime3D;
  if(!THREE||!api) return;
  api.previewScenes=new Map();
  const portraitCache=new Map();
  const validCharacterIds=new Set(['m1','m2','m3','m4','m5','m6','f1','f2','f3','f4','f5','f6']);
  let portraitRenderer=null,portraitScene=null,portraitCamera=null,portraitRoot=null;

  function disposeModel(root){
    const geometries=new Set(),materials=new Set();
    root.traverse(o=>{
      if(!o.isMesh)return;
      if(o.geometry)geometries.add(o.geometry);
      (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean).forEach(m=>materials.add(m));
    });
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());root.clear();
  }
  function ensurePortraitRenderer(){
    if(portraitRenderer)return;
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
    portraitRenderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
    portraitRenderer.setPixelRatio(1);portraitRenderer.setSize(256,256,false);
    portraitRenderer.outputColorSpace=THREE.SRGBColorSpace;
    portraitRenderer.toneMapping=THREE.ACESFilmicToneMapping;portraitRenderer.toneMappingExposure=1.08;
    portraitRenderer.setClearColor(0x071126,0);
    portraitScene=new THREE.Scene();
    portraitCamera=new THREE.PerspectiveCamera(32,1,.1,24);
    portraitCamera.position.set(0,2.18,5.4);portraitCamera.lookAt(0,2.08,0);
    portraitScene.add(new THREE.HemisphereLight(0xc8e2ff,0x141321,2.5));
    const key=new THREE.DirectionalLight(0xffd9ac,3.7);key.position.set(3.4,5.8,5.5);portraitScene.add(key);
    const fill=new THREE.DirectionalLight(0x45bfff,2.1);fill.position.set(-4,3,2);portraitScene.add(fill);
    const rim=new THREE.PointLight(0xb24dff,18,10);rim.position.set(2.5,3,-3);portraitScene.add(rim);
    portraitRoot=new THREE.Group();portraitScene.add(portraitRoot);
  }
  api.getCharacterPortrait=function(characterId){
    const id=validCharacterIds.has(characterId)?characterId:'m1';
    return Promise.resolve(avatarCanvas(id).toDataURL('image/png'));
  };
  api.loadCharacterPortraits=function(root){
    if(!root)return;
    root.querySelectorAll('[data-character-model]').forEach(node=>{
      if(node.tagName==='CANVAS'&&node.dataset.drawn)return;
      const id=AVATAR_STYLE[node.dataset.characterModel]?node.dataset.characterModel:'m1';
      const canvas=document.createElement('canvas');canvas.className='character-inline-canvas';canvas.setAttribute('aria-hidden','true');canvas.dataset.characterModel=id;canvas.dataset.drawn='true';
      drawAvatar(canvas,id);node.replaceWith(canvas);
    });
  };
  api.initPreview=function(stage,characterId){
    if(!stage)return null;
    stage.querySelector('.preview-character-fallback')?.remove();
    const canvas=document.createElement('canvas');canvas.className='character-preview-canvas';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Selected cartoon character');
    drawAvatar(canvas,characterId);stage.replaceChildren(canvas);return canvas;
  };
})();

  window.dispatchEvent(new Event('beat-time-3d-ready'));
})();

