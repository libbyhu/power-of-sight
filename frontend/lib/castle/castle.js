/*
 * 古堡交誼廳的像素場景（開場動畫與首頁主視覺共用）。
 * 所有道具都在 480 × 270 的畫布上以整數像素繪製，最後再放大到實際尺寸。
 * 型別宣告見同目錄的 castle.d.ts。
 */
const Castle = (() => {
  const palette = {
    night:'#15121a', mortar:'#30242e', brick:'#734749', oak:'#422723',
    trim:'#9c6345', amber:'#ffc782', moss:'#657958', moon:'#94accf'
  };
  let ctx;
  let setBuffer;
  let shadowBuffer;
  const rect = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),w,h); };
  function poly(points,c) {
    ctx.fillStyle=c;
    ctx.beginPath();
    points.forEach(([x,y],i) => i ? ctx.lineTo(Math.round(x),Math.round(y)) : ctx.moveTo(Math.round(x),Math.round(y)));
    ctx.closePath(); ctx.fill();
  }
  function noise(n) {
    const v=Math.sin(n*127.1+15.3)*43758.5453;
    return v-Math.floor(v);
  }
  function arch(x,y,w,h,c) {
    poly([[x,y+h],[x,y+21],[x+4,y+12],[x+12,y+5],[x+w/2,y],[x+w-12,y+5],
      [x+w-4,y+12],[x+w,y+21],[x+w,y+h]],c);
  }
  function glow(x,y,r,color) {
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,color); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  function shadowLayer(paint,opacity=1) {
    const scene=ctx;
    if(!shadowBuffer){
      shadowBuffer=document.createElement('canvas');
      shadowBuffer.width=480;
      shadowBuffer.height=270;
    }
    ctx=shadowBuffer.getContext('2d');
    ctx.clearRect(0,0,480,270);
    rect(0,0,480,270,'#07060bfc');
    ctx.globalCompositeOperation='destination-out';
    paint();
    ctx.globalCompositeOperation='source-over';
    ctx=scene;
    ctx.save();
    ctx.globalAlpha=opacity;
    ctx.drawImage(shadowBuffer,0,0);
    ctx.restore();
  }
  function stairLighting(t,open,x,y,dir,ease) {
    const flicker=Math.sin(t*15+Math.sin(t*9));
    const ahead=x+dir*24;
    shadowLayer(()=>{
      glow(x-dir*10,y-20,54+flicker*2,'#000000ff');
      glow(ahead,y-10,69+flicker*2,'#000000ed');
      glow(x,y,32,'#000000bb');
      const near=ease(1-Math.abs(x-134)/48-Math.abs(y-181)/59);
      if(near>0) glow(134,174,30,`rgba(0,0,0,${near*.65})`);
      if(open>0){
        glow(326,61,39+23*open,`rgba(0,0,0,${.32+.63*open})`);
        glow(331,89,48,`rgba(0,0,0,${open*.7})`);
      }
    });
    glow(x+dir*9,y-20,31+flicker,'#fab16a31');
  }
  function masonry(x,y,w,h,warm) {
    rect(x,y,w,h,palette.mortar);
    const colors=warm?['#523038','#62383a','#704143','#573139']:['#332b38','#3b303d','#42333e','#38303a'];
    for(let row=0;row<Math.floor(h/8);row++) for(let col=-1;col<Math.ceil(w/19);col++) {
      const a=col*19+(row%2)*9, left=Math.max(0,a), right=Math.min(w,a+18);
      if(right<=left) continue;
      const n=row*93+col;
      rect(x+left,y+row*8,right-left,7,colors[Math.floor(noise(n)*4)]);
      if(right-left>8) {
        const bx=x+left, by=y+row*8, span=right-left;
        rect(bx+2,by+1,4+Math.floor(noise(n+3)*4),1,warm?'#82504c':'#4a3c48');
        rect(bx+1,by+6,span-3,1,warm?'#482a33':'#282330');
        rect(bx+span-2,by+2,1,3,warm?'#492b33':'#2b2531');
        if(noise(n+7)>.77) {
          rect(bx+5,by+3,3,1,warm?'#99594e':'#59434c');
          rect(bx+7,by+4,1,2,warm?'#482933':'#2a222d');
        }
      }
    }
  }
  function boards(x,y,w,h) {
    rect(x,y,w,h,'#55352f');
    for(let j=0;j<h;j+=6) {
      rect(x,y+j,w,1,'#362528');
      rect(x,y+j+1,w,1,'#704637');
      for(let i=(j%18)*2-22;i<w-2;i+=46) {
        const s=noise(i+j*51);
        if(i<0) continue;
        rect(x+i,y+j+2,1,4,'#37282b');
        rect(x+i+2,y+j+2,Math.min(w-i-2,4+Math.floor(s*18)),1,s>.5?'#805340':'#624036');
        if(s>.66 && i+14<w){
          rect(x+i+11,y+j+4,3,1,'#3f2a2b');
          rect(x+i+12,y+j+5,3,1,'#70473a');
        }
      }
    }
  }
  function ornament(x,y,kind) {
    if(kind==='vase'){
      poly([[x+2,y],[x+7,y],[x+6,y+3],[x+9,y+5],[x+8,y+10],[x+1,y+10],[x,y+5],[x+3,y+3]],'#426360');
      rect(x+1,y+5,2,3,'#7d9a83'); rect(x+3,y+1,4,1,'#bb9c77');
      rect(x+2,y+7,6,1,'#bca177');
    } else if(kind==='box'){
      rect(x,y+3,10,7,'#74463b'); rect(x-1,y+3,12,2,'#a87049');
      rect(x+1,y+6,8,1,'#b78853'); rect(x+4,y+5,2,3,'#e9ba72');
    } else {
      rect(x,y+2,8,8,'#9a704e'); rect(x+1,y+3,6,6,'#473b48');
      poly([[x+1,y+8],[x+4,y+5],[x+7,y+8]],'#8b9ca4');
      rect(x+5,y+4,1,1,'#f6d6a5');
    }
  }
  function shelf(x,y,w,rows,seed) {
    const h=rows*13+6;
    rect(x+2,y+3,w+2,h,'#211923'); rect(x,y,w,h,'#432923');
    rect(x+3,y+3,w-6,h-7,'#221b22');
    const colors=['#af6e4d','#843d4b','#718453','#526e87','#c09a5d','#795977'];
    for(let row=0;row<rows;row++){
      let left=x+5;
      const floor=y+15+row*13;
      if((row+seed)%4===0 && w>32) {
        ornament(left,floor-10,['vase','box','frame'][(seed+row*2)%3]);
        left+=13;
      }
      while(left<x+w-6) {
        const n=seed+left+row*45, tall=5+Math.floor(noise(n)*6);
        rect(left,floor-tall,2,tall,colors[Math.floor(noise(n+1)*6)]);
        if(tall>7) rect(left,floor-tall+2,2,1,'#d39f69');
        left+=3+Math.floor(noise(n+2)*2);
      }
      rect(x+2,floor,w-4,2,'#86523b');
      rect(x+3,floor+1,w-6,1,'#52332d');
    }
    rect(x-2,y-2,w+4,3,'#a46a48');
    rect(x,y+1,2,h-1,'#734535');
    rect(x+w-3,y+2,1,h-4,'#a16a48');
  }
  function lamp(x,y,t) {
    glow(x,y,32,'#fcb05e44');
    rect(x-4,y-6,8,11,'#342330');
    rect(x-3,y-5,6,8,'#e69351'); rect(x-1,y-4,2,6,'#ffe1a0');
    rect(x-5,y+4,10,2,'#8c563e');
    if(Math.floor(t*5)%2===0) rect(x+2,y-3,1,3,'#fff0b0');
  }
  function candle(x,y,t) {
    const sway=Math.round(Math.sin(t*13+x));
    glow(x,y-4,22,'#f6a14d30');
    rect(x-4,y+4,9,2,'#775145');
    rect(x-1,y,3,5,'#cfa887');
    rect(x-1,y,1,4,'#f6d4a3');
    rect(x+sway,y-5,2,4,'#eb914c');
    rect(x+sway,y-3,1,2,'#ffe0a0');
  }
  function beam(x,y,h) {
    rect(x-2,y,14,h,'#25202a');
    rect(x,y,9,h,'#523536');
    rect(x+1,y,1,h,'#93624b'); rect(x+7,y,1,h,'#39282e');
    for(let i=7;i<h-9;i+=17) {
      rect(x+3,y+i,2,7,'#674138');
      rect(x+5,y+i+4,1,8,'#63403a');
    }
  }
  function castShadow(x,y,w,length,lean) {
    poly([[x,y],[x+w,y],[x+w+lean,y+length],[x+lean,y+length]],'#20182230');
    poly([[x+1,y],[x+w-1,y],[x+w+lean*.48,y+length*.52],
      [x+lean*.48,y+length*.52]],'#1b161d45');
  }
  function stonePier(x,y,w,h) {
    rect(x,y,w,h,'#292432');
    rect(x+2,y,w-5,h,'#44313b');
    for(let i=0;i<h;i+=14){
      rect(x+2,y+i,w-6,1,'#1f1a26');
      rect(x+3,y+i+1,w-8,1,'#63454a');
      rect(x+w-5,y+i+3,2,8,'#765055');
    }
    rect(x+w-2,y,2,h,'#171620');
  }
  function cobweb(x,y,flip) {
    const points=[[0,23],[9,20],[17,15],[22,8],[24,0]];
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(flip,1);
    ctx.strokeStyle='#c9a59c78';
    ctx.lineWidth=.65;
    ctx.beginPath();
    for(const [px,py] of points){ctx.moveTo(0,0);ctx.lineTo(px,py);}
    for(const scale of [.32,.57,.83]){
      points.forEach(([px,py],i)=>{
        const method=i===0?'moveTo':'lineTo';
        ctx[method](Math.round(px*scale),Math.round(py*scale));
      });
    }
    ctx.stroke();
    ctx.restore();
  }
  function vines(x,y,seed) {
    for(let i=0;i<29;i++){
      const dx=Math.round(Math.sin(i*.51+seed)*5), dy=i*2;
      rect(x+dx,y+dy,2,4,'#3e514a');
      const side=i%2?1:-1;
      rect(x+dx+side*3,y+dy,4,2,i%3?'#5c6650':'#7b7956');
      if(i%4===0) rect(x+dx+side*4,y+dy-1,2,1,'#9b8a5d');
    }
  }
  function traveler(x,y,t,facing=1,push=0,walk=true) {
    const gait=walk?Math.sin(t*20):0;
    const bob=walk?Math.round(Math.abs(gait)*2):0;
    rect(x-7,y,15,2,'#251a2366');
    ctx.save();
    ctx.translate(Math.round(x),Math.round(y));
    ctx.scale(facing,1);
    const toe=Math.round(gait*3);
    rect(-3-toe,-5,3,5,'#36282a'); rect(-4-toe,-1,5,2,'#4d3430');
    rect(1+toe,-5-Math.max(0,toe),3,5,'#5b3d32');
    rect(1+toe,-1-Math.max(0,toe),5,2,'#a06a4c');
    ctx.translate(Math.round(push*2),-bob);
    poly([[-5,-16],[2,-16],[5,-12],[4,-8],[6,-5],[-5,-5],[-7,-7]],'#29262c');
    poly([[-4,-15],[2,-15],[4,-10],[5,-6],[-5,-6],[-6,-8]],'#627759');
    poly([[-4,-15],[-4,-10],[-5,-7],[-2,-8],[0,-13]],'#859268');
    rect(-4,-7,8,1,'#3f4f42');
    rect(-8,-14,5,8,'#513238'); rect(-7,-14,4,6,'#9d5e45');
    rect(-7,-13,3,2,'#d18b54'); rect(-6,-10,2,1,'#edac65');
    rect(-3,-15,1,7,'#be8a60');
    rect(-3,-22,7,8,'#684038'); rect(-2,-21,6,6,'#e4ac77');
    rect(4,-19,1,2,'#f5c28a'); rect(2,-20,1,1,'#34262c');
    rect(-3,-16,7,2,'#a95446');
    rect(-5-Math.max(0,toe),-15,4,2,'#ce7651');
    poly([[-7,-22],[-5,-24],[-3,-27],[2,-27],[4,-23],[7,-22],[7,-21],[-7,-21]],'#402b31');
    rect(-4,-25,7,3,'#814d3b'); rect(-2,-26,4,1,'#b1704d');
    rect(-5,-23,10,1,'#d3945c'); rect(3,-22,4,1,'#906148');
    const reach=Math.round(push*7);
    const wrist=push>0 ? -10-Math.round(push*3) : -8+Math.round(gait);
    poly([[2,-14],[4,-14],[6+reach,wrist],[5+reach,wrist+2],[2,-10]],'#8b9d72');
    rect(5+reach,wrist,2,2,'#e9ad7b');
    poly([[-5,-13],[-4,-10],[-8,-10],[-11,-13],[-10,-15]],'#7c8d65');
    rect(-11,-15,2,3,'#e9ad7b');
    rect(-11,-18,2,4,'#dfbf91');
    rect(-11,-21,2,3,'#e98d48');
    rect(-10,-20,1,2,'#fff3bd');
    ctx.restore();
  }
  function steps(x,y,dir,count,rise=4) {
    for(let i=0;i<count;i++) {
      const a=x+dir*i*8,b=y+i*rise;
      poly([[a-20,b+rise],[a+12,b+rise],[a+9,b+rise*2+2],
        [a-25,b+rise*2+2]],'#261a286b');
      poly([[a-17,b],[a+17,b],[a+13,b+rise],[a-21,b+rise]],i%2?'#975853':'#a36256');
      poly([[a-21,b+rise],[a+13,b+rise],[a+13,b+rise*2],[a-21,b+rise*2]],'#633942');
      rect(a-13+(i%2)*10,b+1,1,rise-1,'#6e3a40');
      rect(a-19,b+rise,26,1,'#b7735c');
      rect(a-15,b+rise+1,24,1,'#82504a');
      rect(a+3-(i%3)*4,b+2,4,1,'#bc7864');
      if(i%3===0) rect(a-13,b+3,2,1,'#d88e70');
    }
  }
  function door(x,y,open,t) {
    arch(x-5,y-5,54,72,'#9c6451');
    arch(x,y,44,66,'#21191f');
    if(open>0) {
      arch(x+2,y+2,40,64,'#eab173');
      arch(x+5,y+5,34,61,'#ffe1a2');
      poly([[x+9,y+65],[x+42,y+65],[x+50+54*open,y+96],[x+39-60*open,y+96]],'#d59a6559');
      poly([[x+11,y+65],[x+40,y+65],[x+41+31*open,y+92],[x+31-39*open,y+92]],'#facb8a59');
      for(let i=0;i<9;i++){
        const distance=(noise(i+13)+t*.21)%1;
        const px=x+27+(noise(i+51)-.5)*(20+distance*58);
        const py=y+47+distance*47;
        rect(px,py,1,1,distance<.6?'#ffecb77a':'#dca27449');
      }
      glow(x+25,y+54,70,'#ffc27855');
    }
    const w=Math.round(44-open*35);
    if(w>=26) arch(x,y,w,66,'#633d33');
    else poly([[x,y+9],[x+w,y+18],[x+w,y+62],[x,y+66]],'#633d33');
    for(let i=4;i<w-2;i+=6) {
      rect(x+i,y+23,1,42,'#432a29');
      rect(x+i+1,y+25,1,35,'#815039');
      rect(x+i+2,y+34+(i%3)*5,1,8,'#704234');
    }
    if(w>24) {
      for(const inset of [6,w-17]){
        rect(x+inset,y+16,10,13,'#4e302e');
        rect(x+inset+1,y+17,8,10,'#764938');
        rect(x+inset+3,y+18,4,1,'#a76b46');
      }
    }
    rect(x+2,y+30,Math.max(1,w-4),3,'#8c5841');
    rect(x+2,y+51,Math.max(1,w-4),3,'#8c5841');
    rect(x+w-5,y+46,3,3,'#e6ad61');
    rect(x+w-5,y+46,1,1,'#ffdfa0');
    for(const hinge of [26,53]){
      rect(x+1,y+hinge,5,3,'#3c3134'); rect(x+2,y+hinge,1,1,'#ac8062');
    }
    candle(x+60,y+32,t);
  }
  const route=[[98,243],[209,191],[250,191],[196,142],[155,141],[252,85],[290,85]];
  function routePosition(t) {
    const stops=[0,1.15,1.62,2.67,3.09,4.04,4.47];
    let i=0;
    while(i<stops.length-2 && t>stops[i+1]) i++;
    const a=route[i], b=route[i+1];
    const raw=Math.min(1,(t-stops[i])/(stops[i+1]-stops[i]));
    const p=i%2?.42*raw+.58*raw*raw*(3-2*raw):raw;
    return [a[0]+(b[0]-a[0])*p,a[1]+(b[1]-a[1])*p,Math.sign(b[0]-a[0])];
  }
  function stairs(t,ease) {
    masonry(0,0,480,270,true);
    arch(28,34,67,115,'#332532'); arch(34,39,55,105,'#252535');
    poly([[36,74],[75,56],[86,57],[86,127],[57,140],[36,140]],'#35425a');
    for(let i=0;i<13;i++) rect(39+Math.floor(noise(i)*43),60+Math.floor(noise(i+20)*70),1,1,'#9eacc2');
    rect(59,66,3,75,'#352c38'); rect(34,98,55,3,'#352c38');
    arch(363,27,77,159,'#623b40'); arch(369,31,65,146,'#332433');
    rect(400,42,5,132,'#50323a');
    beam(98,0,125); beam(444,0,233);
    stonePier(0,0,22,270);
    stonePier(461,0,19,270);
    vines(438,29,2); vines(26,3,6);
    for(const [x,y] of [[110,209],[150,170],[209,153],[165,108],[258,65],[309,16]]){
      poly([[x,y],[x+14,y],[x+12,y+2],[x+6,y+2],[x+8,y+5],[x+1,y+5]],'#352733');
      rect(x+2,y+5,5,1,'#9a6258');
      rect(x+12,y-2,2,1,'#996258');
    }
    cobweb(128,142,1); cobweb(220,126,-1); cobweb(302,23,1);
    poly([[76,240],[221,164],[296,184],[174,264],[79,264]],'#57323c');
    poly([[135,140],[155,116],[287,104],[264,192],[230,207]],'#54343d');
    poly([[136,129],[264,60],[377,72],[244,153],[152,153]],'#593842');
    poly([[229,71],[360,71],[390,91],[253,99],[218,89]],'#a16355');
    steps(240,85,-1,13);
    poly([[139,133],[207,133],[228,145],[156,150]],'#ac6e5a');
    steps(195,140,1,9,6);
    poly([[194,185],[259,185],[279,197],[207,201]],'#ac6e5a');
    steps(210,188,-1,15);
    castShadow(215,190,26,9,17);
    castShadow(156,143,24,8,12);
    candle(134,174,t);
    rect(100,146,2,10,'#bd7954'); rect(108,146,2,10,'#895344');
    const open=.14*ease((t-4.88)/.28)+.86*ease((t-5.25)/.75);
    door(300,19,open,t);
    const [x,y,dir]=routePosition(t);
    const reach=ease((t-4.49)/.37)*(1-ease((t-5.66)/.36));
    let lightX=x, lightY=y;
    if(t<6.02) traveler(x,y,t,dir,reach,t<4.47);
    else if(t<6.93) {
      const crossing=ease((t-6.02)/.84);
      lightX=290+37*crossing;
      lightY=85-12*crossing;
      ctx.save();
      ctx.globalAlpha=1-ease((crossing-.71)/.29);
      traveler(lightX,lightY,t);
      ctx.restore();
    } else {
      lightX=327;
      lightY=73;
    }
    const shade=ctx.createLinearGradient(0,175,0,270);
    shade.addColorStop(0,'transparent'); shade.addColorStop(1,'#18122185');
    ctx.fillStyle=shade;ctx.fillRect(0,175,480,95);
    stairLighting(t,open,lightX,lightY,dir,ease);
  }
  function moonWindow(x,y){
    arch(x-6,y-7,84,126,'#66505d'); arch(x,y,72,115,'#303554');
    arch(x+4,y+5,64,106,'#424c74');
    for(let i=0;i<38;i++){
      const sx=x+9+Math.floor(noise(i+215)*54), sy=y+20+Math.floor(noise(i+986)*70);
      rect(sx,sy,i%8===0?2:1,1,i%3===0?'#d0d8e2':'#788db5');
    }
    poly([[x+42,y+18],[x+50,y+18],[x+56,y+23],[x+58,y+32],[x+55,y+40],[x+48,y+44],[x+40,y+43],[x+34,y+37],[x+33,y+28],[x+36,y+22]],'#d0dded');
    poly([[x+4,y+91],[x+20,y+65],[x+36,y+93],[x+47,y+74],[x+68,y+100],[x+68,y+111],[x+4,y+111]],'#303c58');
    rect(x+34,y+4,4,110,'#65566a'); rect(x+2,y+55,68,3,'#65566a');
    rect(x+35,y+5,1,107,'#a08798');
    rect(x+3,y+55,65,1,'#8c778f');
    for(const dx of [15,54]){
      rect(x+dx,y+15,1,97,'#595873');
      for(let dy=28;dy<109;dy+=15){
        rect(x+dx-1,y+dy,3,1,'#82819c');
        rect(x+dx,y+dy-1,1,3,'#82819c');
      }
    }
    rect(x-8,y+113,88,4,'#987277'); rect(x-5,y+117,82,3,'#523c49');
  }
  function fire(x,y,t) {
    glow(x+24,y+24,68,'#fba45b3d');
    rect(x-4,y-3,56,35,'#85584b'); rect(x-7,y-6,62,5,'#aa7455');
    rect(x-6,y-6,61,1,'#d29969');
    for(let i=0;i<4;i++){
      const yy=y+3+i*7;
      rect(x-3,yy,8,1,'#5d3c3d'); rect(x+43,yy,8,1,'#5d3c3d');
    }
    arch(x+6,y+3,36,28,'#281e25');
    rect(x+8,y+27,32,3,'#6f3b32'); rect(x+12,y+25,25,3,'#ad5f43');
    const f=Math.floor(t*8)%3;
    poly([[x+13,y+26],[x+15,y+18],[x+20,y+21],[x+24,y+8+f],[x+29,y+20],[x+34,y+15-f],[x+37,y+27]],'#f48a4a');
    poly([[x+18,y+26],[x+22,y+21],[x+25,y+15+f],[x+29,y+22],[x+32,y+20],[x+33,y+27]],'#ffcf81');
    rect(x-8,y+31,64,5,'#a17259');
    for(let i=0;i<6;i++){
      const age=(t*13+i*4)%20;
      rect(x+17+noise(i+90)*16+Math.sin(age*.4+i)*4,y+22-age,1,1,
        age<9?'#ffd193':'#c26c47');
    }
  }
  function chair(x,y,c) {
    castShadow(x-3,y+20,22,9,12);
    rect(x,y,16,20,'#3b2928'); rect(x+2,y,12,15,c);
    rect(x-3,y+12,22,5,'#885543'); rect(x,y+16,16,4,c);
    rect(x,y+20,2,4,'#2b2022'); rect(x+14,y+20,2,4,'#2b2022');
    rect(x+3,y+1,10,1,'#d1a87865');
    rect(x+4,y+3,1,8,'#ecd09b38');
    rect(x+7,y+6,2,2,'#d0a57b');
    rect(x+1,y+17,14,1,'#ead1ad30');
    rect(x+1,y+19,14,1,'#271c2740');
  }
  function rug(x,y,w,c) {
    poly([[x,y],[x+w,y],[x+w+12,y+14],[x-10,y+14]],'#402831');
    poly([[x+1,y+2],[x+w-1,y+2],[x+w+8,y+12],[x-6,y+12]],c);
    rect(x+1,y+2,w-2,1,'#d2a47a75');
    rect(x-5,y+11,w+11,1,'#d2a47a75');
    for(let i=5;i<w-4;i+=7){
      rect(x+i,y+5,3,4,'#a36958');
      rect(x+i+1,y+6,1,2,'#dfb486');
      rect(x+i-6,y+14,2,2,'#96755d');
    }
  }
  function crt(x,y) {
    rect(x-3,y+16,33,4,'#926044'); rect(x,y+20,3,7,'#53352c'); rect(x+24,y+20,3,7,'#53352c');
    rect(x,y,27,16,'#8e604b'); rect(x+2,y+2,20,12,'#25242c');
    rect(x+4,y+4,16,8,'#648176'); rect(x+5,y+5,12,1,'#91a293');
    for(let row=6;row<12;row+=2) rect(x+5,y+row,14,1,'#536e66');
    poly([[x+5,y+11],[x+10,y+7],[x+13,y+10],[x+17,y+8],[x+19,y+11]],'#9caf96');
    rect(x+24,y+4,2,2,'#c3845a'); rect(x+24,y+8,2,2,'#d2a169');
  }
  function pottedFern(x,y) {
    castShadow(x-5,y+4,10,5,9);
    poly([[x-6,y-4],[x+6,y-4],[x+4,y+5],[x-4,y+5]],'#8e5445');
    rect(x-6,y-5,12,2,'#bf8564');
    rect(x,y-19,1,15,'#68784e');
    for(const [dx,dy] of [[-9,-16],[6,-15],[-7,-12],[5,-10],[-4,-21],[3,-23]]){
      poly([[x,y-7],[x+dx,y+dy],[x+dx+3,y+dy],[x+1,y-9]],dx<0?'#52715c':'#7c8f63');
      rect(x+dx+1,y+dy,2,1,'#9da97a');
    }
  }
  function crystals(x,y) {
    castShadow(x-6,y,15,5,7);
    poly([[x-7,y],[x-8,y-7],[x-5,y-11],[x-2,y-7],[x-1,y],[x-4,y+2]],'#74648e');
    poly([[x-2,y],[x-2,y-12],[x+2,y-17],[x+6,y-12],[x+5,y],[x+2,y+2]],'#667ca0');
    poly([[x+1,y-14],[x+2,y-17],[x+5,y-12],[x+3,y-2],[x+1,y]],'#a1bfd0');
    poly([[x+5,y],[x+6,y-7],[x+10,y-9],[x+11,y-5],[x+9,y]],'#926e9b');
  }
  function chandelier(x,y,t) {
    for(let i=0;i<y-4;i+=4){
      rect(x-1,i,3,3,'#392b33'); rect(x,i,1,2,'#a07b5c');
    }
    poly([[x-22,y],[x+22,y],[x+24,y+3],[x+15,y+7],[x-15,y+7],[x-24,y+3]],'#3e2c32');
    rect(x-20,y+2,40,2,'#99704d');
    rect(x-12,y+5,24,1,'#6d4a3a');
    for(const dx of [-18,-7,7,18]) candle(x+dx,y-5,t);
  }
  function animals(t) {
    // Owl on the moon sill, sleeping cat by the hearth, fawn in the lower alcove.
    rect(295,121,9,9,'#9c7859'); rect(295,119,2,3,'#bb946d'); rect(302,119,2,3,'#bb946d');
    rect(296,122,7,4,'#d6b082');
    if(Math.floor(t*3)%13!==0){rect(297,123,1,2,'#2f2530');rect(301,123,1,2,'#2f2530');}
    rect(299,125,1,2,'#d79953');
    const breath=Math.floor((Math.sin(t*2.4)+1)*.75);
    rect(341,191-breath,15,6+breath,'#b87558'); rect(349,187,8,8,'#ce895f');
    rect(349,185,2,3,'#ce895f'); rect(355,185,2,3,'#ce895f');
    rect(352,191,3,1,'#52363a'); rect(338,194,14,2,'#da9a69');
    rect(171,221,19,8,'#b98260'); rect(181,213,6,11,'#c4906b');
    rect(181,209,10,7,'#c4906b'); rect(181,206,2,4,'#a96757'); rect(187,206,2,4,'#a96757');
    rect(191,213,2,2,'#edd09f');rect(188,211,1,1,'#2b242b');
    rect(173,228,2,7,'#87604f'); rect(185,228,2,7,'#87604f');
    rect(175,223,2,1,'#f5c796'); rect(179,222,2,1,'#f5c796');
    if(t%4>2.86 && t%4<3.24) rect(187,205,3,2,'#b47b62');
  }
  function room(t,progress,walk,ease) {
    rect(0,0,480,270,palette.night);
    masonry(0,0,480,212,false);
    poly([[0,0],[57,25],[57,177],[0,230]],'#2b242f');
    poly([[480,0],[439,31],[439,204],[480,242]],'#33262e');
    beam(11,0,147); beam(222,0,153); beam(319,0,149); beam(448,0,209);
    rect(62,16,153,3,'#57383a'); rect(60,15,156,1,'#875746');
    moonWindow(240,14);
    boards(0,204,480,66);
    poly([[245,122],[310,122],[397,252],[227,231]],'#6e79aa21');
    poly([[249,124],[268,124],[296,238],[242,232]],'#9aaed13d');
    poly([[273,124],[299,124],[368,248],[306,240]],'#8dacd13d');
    poly([[303,124],[308,124],[385,250],[376,249]],'#b0bdd530');
    castShadow(38,211,61,14,22);
    castShadow(105,232,37,16,24);
    castShadow(354,178,39,12,-24);
    // Left gallery and diagonal stairs down to the main level.
    poly([[11,134],[147,134],[210,163],[54,163]],'#8a5843');
    poly([[54,163],[210,163],[210,176],[54,176]],'#4b3031');
    poly([[11,134],[54,163],[54,176],[11,149]],'#634035');
    rect(54,163,155,2,'#ba8056');
    for(let i=0;i<10;i++){
      rect(63+i*14,147,2,17,'#6d493e');
      if(i<7) rect(60+i*14,146,14,2,'#a46b4b');
    }
    for(let i=0;i<9;i++){
      const x=206+i*3,y=166+i*5;
      rect(x,y,31,4,'#92604b'); rect(x,y+4,31,2,'#50343a');
      rect(x+2,y,27,1,'#ba8260');
      rect(x+5,y+2,10+(i%3)*3,1,'#744b3c');
    }
    shelf(20,52,44,6,1); shelf(70,47,47,6,2); shelf(128,30,53,7,3);
    shelf(188,47,36,6,33); shelf(332,32,48,7,4); shelf(389,20,51,8,6);
    chandelier(207,33,t);
    pottedFern(69,141);
    rect(377,8,65,5,'#6d4540'); rect(379,8,65,1,'#aa7652');
    vines(447,17,5);
    rect(184,83,2,48,'#a16f53'); rect(192,83,2,48,'#a16f53');
    for(let y=87;y<131;y+=6) rect(185,y,8,1,'#d49765');
    rug(88,130,41,'#754744'); chair(114,112,'#657958');
    rect(88,127,12,5,'#976348'); rect(90,132,2,7,'#442a28');
    poly([[87,124],[91,123],[94,125],[98,123],[101,124],[100,128],[94,129],[88,128]],'#e1bf8c');
    rect(94,125,1,4,'#a37b5c');
    lamp(79,111,t);
    // Screen nook is tucked behind a short bookcase on the lower left.
    poly([[8,191],[103,191],[123,211],[20,211]],'#674139');
    shelf(10,144,48,4,16); rug(51,222,62,'#68534f');
    crt(31,196); chair(78,198,'#784d4d'); shelf(104,183,36,4,21);
    lamp(94,181,t);
    pottedFern(17,231);
    // Hearth and chair sit at a different depth from the CRT nook.
    rug(322,191,65,'#8f5048'); fire(348,141,t); chair(399,162,'#6a7856');
    ornament(348,125,'vase'); ornament(382,125,'frame');
    crystals(316,194);
    rect(411,185,13,4,'#8c563c'); rect(414,188,2,6,'#472d2b');
    rect(415,181,5,4,'#a57859'); rect(420,182,2,2,'#ba9269');
    shelf(430,142,39,5,32); lamp(451,133,t);
    // Foreground shelf makes a small reading alcove on the right.
    rug(385,233,68,'#71504c'); chair(408,201,'#775753');
    rect(392,222,15,5,'#925d42'); rect(394,226,2,5,'#482b28'); rect(396,219,8,3,'#d9a66a');
    ornament(421,220,'box');
    candle(399,217,t);
    pottedFern(461,218);
    lamp(451,203,t); shelf(441,222,38,3,5);
    // Entrance and the traveling silhouette stay visible during the pullback.
    arch(271,159,30,46,'#62413b');
    poly([[274,172],[279,165],[288,162],[295,168],[298,176],[298,204],[274,204]],'#392830');
    rect(274,201,26,3,'#a66a4c');
    poly([[277,200],[295,200],[318,226],[264,226]],'#f4be7d30');
    glow(286,198,37,'#e7a2683d');
    animals(t);
    traveler(285-26*progress,207+16*progress,t,-1,0,walk);
    for(let i=0;i<25;i++){
      const y=(noise(i+42)*243-t*(2+i%3)+480)%243;
      const x=35+noise(i+815)*410;
      rect(x,y,1,1,i%3===0?'#c89668':'#8e726955');
    }
    const flicker=.5+.5*Math.sin(t*11+Math.sin(t*7));
    glow(373,175,68,`rgba(250,146,74,${.11+.05*flicker})`);
    glow(262,102,76,'#95bdfa19');
    glow(42,203,38,'#80b3a61d');
    const corners=ctx.createRadialGradient(272,150,96,272,150,264);
    corners.addColorStop(0,'#15111c00');
    corners.addColorStop(1,'#15111cad');
    ctx.fillStyle=corners;
    ctx.fillRect(0,0,480,270);
    stonePier(0,217,16,53);
    stonePier(469,185,11,85);
    const reveal=ease((t-7.1)/3.47);
    if(reveal<1){
      const x=285-26*progress, y=207+16*progress;
      shadowLayer(()=>{
        glow(x+6,y-20,52+reveal*57,'#000000ff');
        glow(x-15,y-15,48+reveal*58,'#000000bf');
        glow(274,73,48+reveal*96,`rgba(0,0,0,${.50+.46*reveal})`);
        glow(285,124,41+reveal*104,`rgba(0,0,0,${.21+.7*reveal})`);
      },1-reveal);
      glow(x+6,y-21,32,'#ffc38225');
    }
    const shade=ctx.createLinearGradient(0,223,0,270);
    shade.addColorStop(0,'transparent');shade.addColorStop(1,'#19131cc2');
    ctx.fillStyle=shade;ctx.fillRect(0,223,480,47);
  }
  function shot(context,time,ease,still,interior,opacity=1) {
    ctx=setBuffer.getContext('2d');
    rect(0,0,480,270,palette.night);
    let zoom, focusX, focusY;
    if(!interior){
      stairs(time,ease);
      const [x,y]=routePosition(time);
      const doorFocus=ease((time-3.3)/2.65);
      const threshold=ease((time-6.18)/.76);
      zoom=1.40+.96*doorFocus+.38*threshold;
      focusX=(x+34)*(1-doorFocus)+(321+5*threshold)*doorFocus;
      focusY=Math.min(233,y-12)*(1-doorFocus)+55*doorFocus;
    } else {
      room(time,ease((time-7.08)/2.2),!still&&time<9.28,ease);
      const pullback=ease((time-7.05)/3.65);
      zoom=1+1.13*(1-pullback);
      focusX=284;
      focusY=166-36*ease((time-7.25)/1.75);
    }
    // Scale the pixel buffer after drawing the set, keeping sprite edges crisp.
    ctx=context;
    ctx.save();
    ctx.globalAlpha=opacity;
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(setBuffer,Math.round(focusX*(1-zoom)),Math.round(focusY*(1-zoom)),
      Math.round(480*zoom),Math.round(270*zoom));
    ctx.restore();
  }
  return {draw(context,time,ease,still=false){
    if(!setBuffer){
      setBuffer=document.createElement('canvas');
      setBuffer.width=480;
      setBuffer.height=270;
    }
    context.save();
    context.scale(context.canvas.width/480,context.canvas.height/270);
    const blend=ease((time-6.62)/.60);
    if(blend<1) shot(context,time,ease,still,false);
    if(blend>0) shot(context,time,ease,still,true,blend);
    // Keep the threshold readable through the bloom. The room fades in beneath it.
    const light=ease((time-6.31)/.57)*(1-ease((time-6.92)/.58));
    if(light>0){
      const x=326-42*blend,y=48+137*blend;
      glow(x,y,42+104*light,`rgba(255,215,159,${.38*light})`);
      glow(x,y,125+120*light,`rgba(230,158,100,${.17*light})`);
    }
    context.restore();
  }};
})();

/**
 * 依時間畫出場景。
 * @param context 要畫上去的 2D 畫布
 * @param time 動畫經過的秒數（0–12）；12 秒是最後的靜態交誼廳
 * @param ease 0–1 的緩動函式
 * @param still true 時不畫走動中的動作，用於靜態畫面
 */
export function drawCastle(context, time, ease, still = false) {
  Castle.draw(context, time, ease, still);
}
