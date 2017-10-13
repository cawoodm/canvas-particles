var rng = require("./rng");
var rand = rng(Math.random());

var Fish = function(options) {
  Object.assign(this, {x: 0, y:0, num: 1, hue: 120, size: 5, lifetime: 100, gravity: 2, dd: 100});
  Object.assign(this, options);
  this.objs = [];
  let f = Math.sqrt(this.num)*5;
  for (let i=0; i<this.num; i++) {
    let ang = Math.PI*i/this.num;
    this.objs.push({
      x: this.x+rand.range(-this.size*f, this.size*f),
      y: this.y+rand.range(-this.size*f, this.size*f),
      life: 0,
      size: this.size*rand.range(10,30)/10,
      dx: rand.pick([1,-1])*rand.range(this.dd/2, this.dd),
      dy: rand.range(-this.dd/4, this.dd/4)*Math.sin(ang),
      col: {h: this.hue + rand.range(-10, 10), s: 80+ rand.range(-10, 10), l: 50+ rand.range(-10, 10)}
    });
  }
};
Fish.prototype.update = function(delta) {
  this.objs.forEach((obj, index, objs) => {

    // Lifetime
    obj.life += delta * 50;
    if (obj.life > this.lifetime) objs.splice(index, 1);
    
    // Physics and gravity
    obj.dy += this.gravity;
    obj.x += obj.dx * delta;
    obj.y += obj.dy * delta;

  });
};
Fish.prototype.render = function(ctx) {
  this.objs.forEach((obj, index) => {
    ctx.save();
    ctx.fillStyle = `hsl(${obj.col.h}, ${obj.col.s}%, ${obj.col.l}%)`;
    ctx.translate(obj.x + obj.size/2, obj.y + obj.size/2);
    ctx.scale(Math.abs(obj.dx)/obj.dx, 1);
    let u = obj.size;
    circle(-3*u, -u/3, u/4, 3, 1, 20, 0, 0, 0, 0.8, true); // Tail top
    circle(-3*u, u/3, u/4, 3, 1, -20, 0, 0, 0, 0.8, true); // Tail bottom
    circle(0, 0, u, 3, 1, 0, 0, 0, 0, 1, true); // Body
    circle(2*u, -u/4, u/4, 1, 1, 0, 0, 0, 30, 1); // Eye
    circle(2*u, -u/4, u/10, 1, 1, 0, 0, 0, -100, 1); // Eye
    //circle(2*u, u/3, u/4, 1, 1, 0, 0, 0, 100, 1);
    ctx.restore();
    function circle(x, y, r, w, h, rot, hue, sat, lum, alpha=1, stroke=false) {
      ctx.save();
      ctx.fillStyle = `hsla(${obj.col.h+hue}, ${obj.col.s+sat}%, ${obj.col.l+lum}%, ${alpha})`;
      if (stroke) ctx.strokeStyle = `hsla(${obj.col.h+hue}, ${obj.col.s+sat}%, ${obj.col.l-20}%, ${0.5})`;
      ctx.lineWidth = 2;
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot*Math.PI/180);
      ctx.beginPath();
      ctx.scale(w, h);
      ctx.arc(0, 0, r, 0, Math.PI * 2, true);
      ctx.closePath();
      if (stroke) ctx.stroke();
      ctx.fill();
      ctx.restore();
    }
  });
};
module.exports = Fish;