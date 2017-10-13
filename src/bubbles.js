var rng = require("./rng");
var rand = rng(Math.random());
var dp = console.log;

var Bubbles = function(options) {
  Object.assign(this, {x: 0, y:0, height: 1, num: rand.range(10, 40), hue: 240, size: 25, lifetime: 1100, gravity: -20});
  Object.assign(this, options);
  this.ox = this.x;
  this.oy = this.y;
  this.ang = 0;
  this.age = 0;
  this.objs = [];
  for (let i=0; i<this.num; i++) {
    let ang = Math.PI*i/(this.num-1);
    let dy = rand.range(-30, 30);
    let dsy = 1-(dy+30)/60;
    this.objs.push({
      x: this.x + rand.range(-3*this.size, 3*this.size),
      y: this.y + dy,
      dy: this.gravity + dy*dsy,
      life: 0,
      size: this.size * dsy,
      scale: rand.range(1,3),
      col: {h: this.hue + rand.range(-10, 10), s: 30, l: 80}
    });
  }
};
Bubbles.prototype.update = function(delta) {
  this.ang = (++this.ang)%360;
  this.alpha = Math.max(0, 0.6-this.age);
  this.objs.forEach((obj, index, objs) => {

    // Lifetime
    obj.life += delta * 50;
    obj.age = (this.height-obj.y)/this.height;
    if (obj.age >= 1.0) return objs.splice(index, 1);
    
    // Grow with age
    obj.size = 1+0.5*obj.scale*this.size*obj.age;

    // Physics and gravity
    let lshift = 15*obj.age;
    let shift = 360 * index/objs.length + rand.range(-lshift, lshift);
    let lspeed = 4;
    let fn = index%2===0?Math.sin:Math.cos;
    let dx = 0.1*(obj.y-this.oy)*fn((shift+this.ang*lspeed)*Math.PI/180);
    obj.x = this.ox + dx;
    obj.y += obj.dy * delta;
    this.age = Math.max(this.age, obj.age);
  });
};
Bubbles.prototype.render = function(ctx) {
  ctx.globalAlpha = this.alpha;
  this.objs.forEach((obj, index, objs) => {
    ctx.save();
    ctx.strokeStyle = `hsl(${obj.col.h}, ${obj.col.s}%, ${obj.col.l}%)`;
    ctx.translate(obj.x, obj.y);
    ctx.beginPath();
    ctx.arc(0, 0, obj.size, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  });
};
module.exports = Bubbles;