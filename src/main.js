var raf = require("./raf");
var rng = require("./rng");
var f = require("./functions");
var Explosion = require("./explosion");
var Fish = require("./fish");

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
entities=[];
entities.push(new Explosion({x: canvas.width/2, y: canvas.height/2, hue: rand.range(0, 360)}));
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
}
canvas.addEventListener("click", function(e) {
  entities.push(new Explosion({x: e.clientX, y: e.clientY, num: rand.range(100, 1500), gravity: 20, dd: 130, hue: rand.range(0, 360)}));
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

  objs.forEach(function(obj, index, object) {
    return
    // Lifetime
    obj.lifecount += elapsed * 50;
    obj.alpha = 1-obj.lifecount/obj.lifetime;
    
    // Kill
    if (obj.lifecount>obj.lifetime) object.splice(index, 1);
    if (obj.lifecount>obj.lifetime/2) obj.g=rand.pick([-1,0,1]);
    
    // Gravity
    if (obj.g!==0) {
      let [dx, dy] = [gravity.x - obj.x, gravity.y - obj.y];
      let dr = Math.max(10, Math.sqrt(dx**2/1000 + dy**2/1000));
      let [ax, ay] = [dx/Math.abs(dx), dy/Math.abs(dy)];
      //obj.size = dr;
      obj.dx += obj.g * elapsed * ax * gravity.f / dr**2;
      obj.dy += obj.g * elapsed * ay * gravity.f / dr**2;
    }
    let max = {x: 0.5+200*osc[0].x/2, y: 0.5+200*osc[0].x/2};
    obj.dx = obj.dx>0?Math.min(max.x, obj.dx):Math.max(-max.x, obj.dx);
    obj.dy = obj.dy>0?Math.min(max.y, obj.dy):Math.max(-max.y, obj.dy);
    
    // Handle collision against the canvas's edges
    if (osc[0].x>0.5) if (obj.x - obj.size < 0 && obj.dx < 0 || obj.x + obj.size > canvas.width && obj.dx > 0) obj.dx = -obj.dx * 0.7;
    if (osc[0].y>0.5) if (obj.y - obj.size < 0 && obj.dy < 0 || obj.y + obj.size > canvas.height && obj.dy > 0) obj.dy = -obj.dy * 0.7;

    // Update obj position
    obj.x += obj.dx * elapsed;
    obj.y += obj.dy * elapsed;

    // Transparency
    ctx.globalAlpha = obj.alpha;
    
    // Color
    if (osc[0].a>0.5 || obj.x<0) obj.hue.h = 360*obj.scale.x; else obj.hue.h = 360*obj.x/canvas.width;
    ctx.fillStyle = `hsl(${obj.hue.h}, ${obj.hue.s}%, ${obj.hue.l}%)`;
    
    // Scale
    obj.width = obj.size*obj.scale.x;
    obj.height = obj.size*obj.scale.y;
    
    ctx.save();
    ctx.translate(obj.x + obj.width/2, obj.y + obj.height/2);
    if (obj.rot) ctx.rotate(720*obj.alpha*Math.PI/180);
    //if (obj.scale) ctx.scale(obj.scale.x, obj.scale.y);
    // Shape
    if (obj.type==="o") {
      ctx.beginPath();
      ctx.arc(0, 0, obj.size, 0, Math.PI * 2, true);
      ctx.arc(obj.size/2, 0, obj.size, 0, Math.PI * 2, true);
      ctx.arc(obj.size, 0, obj.size, 0, Math.PI * 2, true);
      ctx.arc(obj.size*3/2, 0, obj.size, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, obj.width, obj.height);
      ctx.fillRect(-obj.height/2, -obj.width/2, obj.height, obj.width);
      //ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
    ctx.restore();
  });

  entities.forEach((ent, index)=>{
    ent.update(elapsed);
    if (ent.objs.length===0) return entities.splice(index, 1);
    ctx.save();
    ent.render(ctx);
    ctx.restore();
  });
});
