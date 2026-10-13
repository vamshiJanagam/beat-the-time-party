(() => {
  const AVATAR_STYLE = {
    m1:{skin:0xf1bd98,shirt:0x2377f5,trim:0x55dfff,hair:0x211512,hairStyle:'swept',iris:0x633b22,fit:'hoodie',face:[.84,1.04],eyes:[1.1,1.05],brow:'soft',mouth:'smile'},
    m2:{skin:0xeab18d,shirt:0xff8b28,trim:0xffd45a,hair:0x2b1712,hairStyle:'spiky',iris:0x397c91,fit:'varsity',face:[1.14,1.02],eyes:[.92,.82],brow:'angled',mouth:'grin'},
    m3:{skin:0xc98561,shirt:0x20a975,trim:0xafff70,hair:0x171311,hairStyle:'curly',iris:0x9a6030,fit:'sport',face:[1.16,.90],eyes:[1.34,1.25],brow:'soft',mouth:'open',freckles:true},
    m4:{skin:0xf0bf9e,shirt:0x8255df,trim:0xc4a4ff,hair:0x2b1712,hairStyle:'short',iris:0x73552e,fit:'jacket',glasses:true,beard:true,face:[1.12,1.12],eyes:[.74,.78],brow:'angled',mouth:'smile'},
    m5:{skin:0xd99370,shirt:0xf0445f,trim:0xffc442,hair:0x211713,hairStyle:'cap',iris:0x4f8191,fit:'team',cap:0x2447db,face:[.82,.94],eyes:[1.2,1.12],brow:'soft',mouth:'grin'},
    m6:{skin:0xa96d52,shirt:0x12aeb8,trim:0x80f4e8,hair:0x171514,hairStyle:'undercut',iris:0x60482d,fit:'zip',face:[1.16,1.02],eyes:[.82,.84],brow:'angled',mouth:'smile',beautyMark:true},
    f1:{skin:0xf1bd98,shirt:0xf04496,trim:0xffb8dc,hair:0x4a241a,hairStyle:'long',iris:0x54835b,fit:'hoodie',face:[.82,1.08],eyes:[1.38,1.26],brow:'soft',mouth:'smile'},
    f2:{skin:0xd89572,shirt:0x3478ee,trim:0x95c4ff,hair:0x241713,hairStyle:'ponytail',iris:0x9a6933,fit:'sport',face:[1.08,1],eyes:[1.12,1.06],brow:'angled',mouth:'grin',beautyMark:true},
    f3:{skin:0xf0b894,shirt:0x8750df,trim:0xf6ca50,hair:0x201513,hairStyle:'bob',iris:0x4380a1,fit:'jacket',face:[.82,1.14],eyes:[1.34,1],brow:'soft',mouth:'open'},
    f4:{skin:0xb9785a,shirt:0x1dbb72,trim:0xb8ff82,hair:0x3a1d15,hairStyle:'curly',iris:0x6e7540,fit:'tee',face:[1.16,.90],eyes:[.88,.84],brow:'angled',mouth:'smile',freckles:true},
    f5:{skin:0xe6a17e,shirt:0xf1832b,trim:0xffd06a,hair:0x8b351b,hairStyle:'long',iris:0x58864c,fit:'sweater',face:[.92,1.16],eyes:[1.22,.90],brow:'soft',mouth:'grin'},
    f6:{skin:0xc98868,shirt:0x16aebb,trim:0xffd654,hair:0x211715,hairStyle:'twin',iris:0x4a83a0,fit:'zip',face:[1.12,.90],eyes:[.82,1.18],brow:'angled',mouth:'smile'}
  };

  const avatarTextureCache=new Map();
  // Paint the cast directly into canvases. This keeps every character original
  // and code-made, and avoids image URLs, external assets, and SVG loaders.
  function drawAvatar(canvas,characterId){
    const s=AVATAR_STYLE[characterId]||AVATAR_STYLE.m1,ctx=canvas.getContext('2d');
    const W=360,H=520;canvas.width=W;canvas.height=H;
    const color=n=>`#${Number(n).toString(16).padStart(6,'0')}`;
    const skin=color(s.skin),shirt=color(s.shirt),trim=color(s.trim),hair=color(s.hair),iris=color(s.iris||0x50351f);
    ctx.clearRect(0,0,W,H);ctx.lineCap='round';ctx.lineJoin='round';
    const ellipse=(x,y,rx,ry,fill,stroke='#17233b',sw=5,rot=0)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.lineWidth=sw;ctx.strokeStyle=stroke;ctx.stroke();}};
    const path=(d,fill,stroke='#17233b',sw=6)=>{ctx.beginPath();d(ctx);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.lineWidth=sw;ctx.strokeStyle=stroke;ctx.stroke();}};
    // Upright legs and shoes: clear silhouette, no chair-sized body shapes.
    path(c=>{c.moveTo(137,314);c.quadraticCurveTo(180,328,223,314);c.lineTo(225,365);c.lineTo(207,391);c.lineTo(221,453);c.quadraticCurveTo(204,466,185,456);c.lineTo(171,382);c.lineTo(153,456);c.quadraticCurveTo(132,466,115,453);c.lineTo(137,379);c.lineTo(126,354);c.closePath();},'#203b70','#142440',8);
    path(c=>{c.moveTo(126,432);c.quadraticCurveTo(143,440,158,433);c.lineTo(151,462);c.quadraticCurveTo(145,473,119,466);c.closePath();},'#182f59','#142440',6);
    path(c=>{c.moveTo(197,433);c.quadraticCurveTo(213,440,228,432);c.lineTo(239,466);c.quadraticCurveTo(214,475,204,462);c.closePath();},'#182f59','#142440',6);
    ellipse(137,472,32,15,'#f2f4f5','#18243a',6,-.04);ellipse(222,472,32,15,'#f2f4f5','#18243a',6,.04);
    // Neck, torso and sleeves.
    path(c=>{c.moveTo(157,192);c.lineTo(203,192);c.lineTo(210,228);c.lineTo(150,228);c.closePath();},skin,'#8d5c4d',4);
    path(c=>{c.moveTo(121,220);c.quadraticCurveTo(180,205,239,220);c.lineTo(229,326);c.quadraticCurveTo(180,342,131,326);c.closePath();},shirt,'#17233b',8);
    ellipse(119,242,25,31,shirt,'#17233b',7,-.22);ellipse(241,242,25,31,shirt,'#17233b',7,.22);
    path(c=>{c.moveTo(103,243);c.quadraticCurveTo(90,237,82,250);c.lineTo(72,294);c.quadraticCurveTo(74,310,89,308);c.lineTo(109,273);c.closePath();},shirt,'#17233b',6);
    path(c=>{c.moveTo(257,243);c.quadraticCurveTo(270,237,278,250);c.lineTo(288,294);c.quadraticCurveTo(286,310,271,308);c.lineTo(251,273);c.closePath();},shirt,'#17233b',6);
    path(c=>{c.moveTo(74,294);c.quadraticCurveTo(81,289,91,299);c.lineTo(98,322);c.quadraticCurveTo(96,335,86,334);c.lineTo(72,316);c.closePath();},skin,'#8d5c4d',4);
    path(c=>{c.moveTo(286,294);c.quadraticCurveTo(279,289,269,299);c.lineTo(262,322);c.quadraticCurveTo(264,335,274,334);c.lineTo(288,316);c.closePath();},skin,'#8d5c4d',4);
    ctx.strokeStyle=trim;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(137,224);ctx.lineTo(180,248);ctx.lineTo(223,224);ctx.stroke();
    if(s.fit==='hoodie'||s.fit==='zip'){
      ctx.strokeStyle='#fff0d0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(169,235);ctx.lineTo(167,281);ctx.moveTo(191,235);ctx.lineTo(193,281);ctx.stroke();
      path(c=>{c.moveTo(145,294);c.quadraticCurveTo(180,305,215,294);c.lineTo(213,321);c.quadraticCurveTo(180,330,147,321);c.closePath();},trim,'#17233b',4);
    } else {ctx.strokeStyle=trim;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(132,276);ctx.quadraticCurveTo(180,289,228,276);ctx.stroke();}
    // Ears and friendly face.
    ellipse(104,136,17,23,skin,'#70483e',4);ellipse(256,136,17,23,skin,'#70483e',4);
    const fx=s.face?.[0]||1,fy=s.face?.[1]||1;ctx.save();ctx.translate(180,133);ctx.scale(fx,fy);ctx.translate(-180,-133);
    path(c=>{c.moveTo(107,86);c.quadraticCurveTo(180,54,253,86);c.lineTo(244,153);c.quadraticCurveTo(236,198,180,204);c.quadraticCurveTo(124,198,116,153);c.closePath();},skin,'#70483e',5);
    const eyeX=s.eyes?.[0]||1,eyeY=s.eyes?.[1]||1;
    [145,215].forEach(x=>{ellipse(x,131,12*eyeX,15*eyeY,'#fffdf6','#765348',2);ellipse(x+2,133,7*eyeX,10*eyeY,iris,null);ellipse(x+3,134,3.4*eyeX,6*eyeY,'#15151b',null);ellipse(x,127,3,3,'#fff',null);});
    ctx.strokeStyle=hair;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(128,105);ctx.quadraticCurveTo(145,96,161,104);ctx.moveTo(199,104);ctx.quadraticCurveTo(215,96,232,105);ctx.stroke();
    ctx.strokeStyle='#b47662';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(180,136);ctx.quadraticCurveTo(173,151,182,153);ctx.stroke();
    ellipse(130,158,15,6,'#ef9990a0',null);ellipse(230,158,15,6,'#ef9990a0',null);
    ctx.strokeStyle='#873e49';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(164,168);ctx.quadraticCurveTo(180,181,197,168);ctx.stroke();
    if(s.freckles){ctx.fillStyle='#9a5845';[0,1,2].forEach(i=>{ctx.beginPath();ctx.arc(137+i*8,158,2,0,Math.PI*2);ctx.arc(211+i*8,158,2,0,Math.PI*2);ctx.fill();});}
    if(s.beautyMark)ellipse(238,157,3,3,'#75493e',null);ctx.restore();
    // Distinct, readable hair silhouettes.
    const style=s.hairStyle;
    if(['long','bob','ponytail','twin'].includes(style)){
      path(c=>{c.moveTo(108,96);c.quadraticCurveTo(78,141,98,211);c.lineTo(127,203);c.lineTo(126,117);c.closePath();},hair,'#261c1a',5);
      path(c=>{c.moveTo(252,96);c.quadraticCurveTo(282,141,262,211);c.lineTo(233,203);c.lineTo(234,117);c.closePath();},hair,'#261c1a',5);
    }
    path(c=>{c.moveTo(101,112);c.quadraticCurveTo(83,68,126,46);c.quadraticCurveTo(173,17,220,44);c.quadraticCurveTo(263,63,259,111);c.quadraticCurveTo(238,89,214,83);c.quadraticCurveTo(187,72,165,91);c.quadraticCurveTo(136,112,101,112);c.closePath();},hair,'#261c1a',7);
    if(style==='spiky')[-1,0,1].forEach((v)=>path(c=>{c.moveTo(145+v*28,65);c.lineTo(139+v*32,27);c.lineTo(166+v*29,56);c.closePath();},hair,'#261c1a',4));
    if(style==='curly')[-2,-1,0,1,2].forEach((v)=>ellipse(136+v*23,52-Math.abs(v%2)*5,18,18,hair,'#261c1a',4));
    if(style==='cap'){ellipse(180,54,65,25,color(s.cap||0x2447db),'#17233b',5);ctx.fillStyle=trim;ctx.fillRect(169,47,20,8);}
    if(style==='ponytail'||style==='twin'){
      ellipse(style==='twin'?94:260,172,18,38,hair,'#261c1a',4,.3);if(style==='twin')ellipse(266,172,18,38,hair,'#261c1a',4,-.3);
    }
    if(s.glasses){ctx.strokeStyle='#17233b';ctx.lineWidth=4;[145,215].forEach(x=>{ctx.beginPath();ctx.arc(x,131,17,0,Math.PI*2);ctx.stroke();});ctx.beginPath();ctx.moveTo(162,131);ctx.lineTo(198,131);ctx.stroke();}
    if(s.beard){path(c=>{c.moveTo(137,166);c.quadraticCurveTo(180,190,223,166);c.quadraticCurveTo(217,207,180,208);c.quadraticCurveTo(143,207,137,166);},hair,'#261c1a',4);}
    ellipse(180,494,105,15,'#06112770',null);
    return canvas;
  }
  function avatarCanvas(id){return drawAvatar(document.createElement('canvas'),id);}
  window.BeatTimeAvatars={styles:AVATAR_STYLE,draw:drawAvatar,canvas:avatarCanvas};
})();

