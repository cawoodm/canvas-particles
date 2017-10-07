var raf = require("./raf");
var rng = require("./rng");
var f = require("./functions");

var canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width=document.documentElement.clientWidth; //window.screen.width/availWidth
canvas.height=document.documentElement.clientHeight; //availHeight
var ctx = canvas.getContext("2d");

var rand = rng(Math.random());
var dp=f.dp;
var g = window.g = {};
var objs = g.objs = [];
var osc = g.osc = [];
osc.push({a:rand.float(1)})
osc.push({a:rand.float(1)})
osc.push({a:rand.float(1)})
let gravity = g.gravity = {l:100, x:canvas.width/2, y:canvas.height/2, f:10000, ans:0.01, d:1};
oscillate(osc[0]);
createBalls();
setInterval(()=>createBalls(), 1500)
setInterval(()=>oscillate(osc[0]), 5000)
function oscillate(o) {
  o.a = ((10*++o.a)%10)/7;
  o.x=Math.cos(o.a);
  o.y=Math.sin(o.a);
}
function createBalls(o) {
  if (objs.length>1000) return;
  o = o||{};
  oscillate(osc[1])
  
  o.x = o.x||canvas.width/2;//+rand.range(-canvas.width/4, canvas.width/4);
  o.y = o.y||canvas.height/2;//rand.int(canvas.height);
  
  o.hue = o.hue || {
    h: osc[0].a*360 // Hue
    ,s: rand.range(50, 100) // Saturation
    ,l: rand.range(50, 100)
  };
  // Size
  o.sr = rand.range(4,36);
  o.spread = {x: rand.range(150, canvas.width), y: rand.range(50, canvas.height/2)};
  o.scale = {x: osc[1].x, y: osc[1].y};
  o.s = o.s||o.sr*osc[0].a;
  
  o.num = o.num||osc[1].a*600;
  o.rot = o.rot||rand.pick([true, false]);
  o.type = o.type||osc[1].a>0.5?"r":"o";
  o.ddx = rand.pick([-100,0,100]);//(Math.round(osc[0].a*10)%2===0)?100:0;
  for (var i = 0; i < o.num; i++) {
    let a = i*360/o.num;
    objs.push({
      x: o.x+o.spread.x*Math.sin(a*Math.PI)
      ,y: o.y+o.spread.y*Math.cos(o.scale.y*o.s*i*Math.PI/180)
      ,size: o.s
      ,scale: o.scale
      ,g: Math.sign(o.ddx)
      ,dx: o.ddx===0?rand.range(-110, 110):0
      ,dy: o.ddx===0?rand.range(-110, 110):0
      ,lifetime: rand.range(250, 300)
      ,lifecount: 0
      ,rot: o.rot
      ,type: o.type
      ,hue: o.hue
    });
  }
  dp(o)
}
canvas.addEventListener("click", function(e) {
  createBalls({x: e.clientX, y: e.clientY, h:180});
});

raf.start(function(elapsed) {
  // Clear the screen
  ctx.fillStyle="black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  oscillate(osc[2])
  
  if ((100*osc[0].a)%3===0) {}
  if (osc[0].a>0.7) {
  //ctx.fillStyle="red";ctx.fillRect(gravity.x, gravity.y, 10, 10);
  if (osc[0].a>0.5) gravity.ans = rand.pick([0.001, 0.01, 0.1]);
  gravity.ang = gravity.ang>0?gravity.ang+gravity.ans:gravity.ans;
  gravity.x = canvas.width/2+gravity.l*Math.cos(gravity.ang);
  gravity.y =canvas.height/2+gravity.l*Math.sin(gravity.ang); 
  }

  objs.forEach(function(entity, index, object) {
    
    // Lifetime
    entity.lifecount += elapsed * 50;
    entity.alpha = 1-entity.lifecount/entity.lifetime;
    
    // Kill
    if (entity.lifecount>entity.lifetime) object.splice(index, 1);
    if (entity.lifecount>entity.lifetime/2) entity.g=rand.pick([-1,0,1]);
    
    // Gravity
    if (entity.g!==0) {
      let [dx, dy] = [gravity.x - entity.x, gravity.y - entity.y];
      let dr = Math.max(10, Math.sqrt(dx**2/1000 + dy**2/1000));
      let [ax, ay] = [dx/Math.abs(dx), dy/Math.abs(dy)];
      //entity.size = dr;
      entity.dx += entity.g * elapsed * ax * gravity.f / dr**2;
      entity.dy += entity.g * elapsed * ay * gravity.f / dr**2;
    }
    let max = {x: 0.5+200*osc[0].x/2, y: 0.5+200*osc[0].x/2};
    entity.dx = entity.dx>0?Math.min(max.x, entity.dx):Math.max(-max.x, entity.dx);
    entity.dy = entity.dy>0?Math.min(max.y, entity.dy):Math.max(-max.y, entity.dy);
    
    // Handle collision against the canvas's edges
    if (osc[0].x>0.5) if (entity.x - entity.size < 0 && entity.dx < 0 || entity.x + entity.size > canvas.width && entity.dx > 0) entity.dx = -entity.dx * 0.7;
    if (osc[0].y>0.5) if (entity.y - entity.size < 0 && entity.dy < 0 || entity.y + entity.size > canvas.height && entity.dy > 0) entity.dy = -entity.dy * 0.7;

    // Update entity position
    entity.x += entity.dx * elapsed;
    entity.y += entity.dy * elapsed;

    // Transparency
    ctx.globalAlpha = entity.alpha;
    
    // Color
    if (osc[0].a>0.5 || entity.x<0) entity.hue.h = 360*entity.scale.x; else entity.hue.h = 360*entity.x/canvas.width;
    ctx.fillStyle = `hsl(${entity.hue.h}, ${entity.hue.s}%, ${entity.hue.l}%)`;
    
    // Scale
    entity.width = entity.size*entity.scale.x;
    entity.height = entity.size*entity.scale.y;
    
    ctx.save();
    ctx.translate(entity.x + entity.width/2, entity.y + entity.height/2);
    if (entity.rot) ctx.rotate(720*entity.alpha*Math.PI/180);
    //if (entity.scale) ctx.scale(entity.scale.x, entity.scale.y);
    // Shape
    if (entity.type==="o") {
      ctx.beginPath();
      ctx.arc(0, 0, entity.size, 0, Math.PI * 2, true);
      ctx.arc(entity.size/2, 0, entity.size, 0, Math.PI * 2, true);
      ctx.arc(entity.size, 0, entity.size, 0, Math.PI * 2, true);
      ctx.arc(entity.size*3/2, 0, entity.size, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, entity.width, entity.height);
      ctx.fillRect(-entity.height/2, -entity.width/2, entity.height, entity.width);
      //ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
    }
    ctx.restore();
  });
});