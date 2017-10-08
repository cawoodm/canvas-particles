var rng = require("./rng");
var rand = rng(Math.random());

var Ocean = function(options) {
  Object.assign(this, {width: 0, height:0});
  Object.assign(this, options);
  this.img = new Image();
  this.img.src = "bg.jpg";
};
Ocean.prototype.update = function(delta) {
};
Ocean.prototype.render = function(ctx) {
  ctx.drawImage(this.img, 0, 0, this.width, this.height)
  let grd = ctx.createLinearGradient(0, 0, this.width/50, this.height/2);
  grd.addColorStop(0, "rgba(0, 0, 0, 0.300)");
  grd.addColorStop(0.2, "rgba(24, 58, 124, 0.60)");
  grd.addColorStop(1, "rgba(4, 2, 24, 1)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, this.width, this.height);
};
module.exports = Ocean;