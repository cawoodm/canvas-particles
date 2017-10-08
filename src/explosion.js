var rng = require("./rng");
var rand = rng(Math.random());

var Explosion = function(options) {
  Object.assign(this, {x: 0, y:0, num: 200, dd: 100, hue: 120, size: 5, lifetime: 100, gravity: 2, dd: 100});
  Object.assign(this, options);
  this.objs = [];
  for (let i=0; i<this.num; i++) {
    let ang = Math.PI*i/(this.num-1);
    this.objs.push({
      x: this.x,
      y: this.y,
      life: 0,
      size: this.size,
      dx: rand.range(-this.dd, this.dd)*Math.cos(ang),
      dy: rand.range(-this.dd, this.dd)*Math.sin(ang)-4*this.dd,
      col: {h: this.hue + rand.range(-10, 10), s: 80, l: 50}
    });
  }
};
Explosion.prototype.update = function(delta) {
  this.objs.forEach((obj, index, objs) => {

    // Lifetime
    obj.life += delta * 50;
    if (obj.life > this.lifetime) objs.splice(index, 1);
    
    // Fade with age
    obj.alpha = 1-obj.life/this.lifetime;

    // Physics and gravity
    obj.dy += this.gravity;
    obj.x += obj.dx * delta;
    obj.y += obj.dy * delta;

  });
};
Explosion.prototype.render = function(ctx) {
  ctx.globalAlpha = this.objs[0].alpha;
  this.objs.forEach((obj, index) => {
    ctx.fillStyle = `hsl(${obj.col.h}, ${obj.col.s}%, ${obj.col.l}%)`;
    ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
  });
};
module.exports = Explosion;